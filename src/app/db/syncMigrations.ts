import { db } from './connection'
import { sql } from 'drizzle-orm'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { createHash } from 'crypto'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import migrationHelpers from './migrationUtils'
import * as schema from './schema'
import { getTableConfig } from 'drizzle-orm/pg-core'

// Controls for dev-only recovery behaviors
// Opt-in controls for dev-only recovery behaviors
const allowBootstrap = process.env.ALLOW_SCHEMA_BOOTSTRAP === 'true' && process.env.NODE_ENV !== 'production'
// Default to FALSE to avoid masking drift; enable explicitly when needed
const allowStateSync = process.env.ALLOW_MIGRATION_STATE_SYNC === 'true'
// Fix missing critical tables (helps with Drizzle's migration hallucinations)
const allowCriticalTableFix = process.env.ALLOW_CRITICAL_TABLE_FIX === 'true' || process.env.NODE_ENV !== 'production'

export async function smartMigrate() {
    try {
        console.log('🔄 Smart migration system starting...')

        // Preflight: apply idempotent ensures for known schema bits
        await preflightEnsureSchema()
        
        // Check for missing critical tables that should exist based on schema
        if (allowCriticalTableFix) {
            await ensureCriticalTablesExist()
        }

        // First, try normal migration
        try {
            console.log('Attempting standard migration...')
            await migrate(db, { migrationsFolder: './src/app/db/migrations' })
            console.log('✅ Standard migration completed successfully')
            return
        } catch (migrationError: any) {
            console.log('⚠️  Standard migration failed, analyzing issue...')

            const msg = (migrationError?.message || '') + ' ' + (migrationError?.cause?.message || '')
            const looksLikeExists = /already exists|42P07|relation .* already exists/i.test(msg)

            // Sync migration state if allowed (helps when DB was initialized outside Drizzle)
            if (allowStateSync) {
                console.log('🔧 Syncing migration state to existing database...')
                await syncMigrationState()
            } else if (looksLikeExists) {
                console.log('⚠️  Migration state sync disabled (safe default). If the DB was pre-initialized, enable ALLOW_MIGRATION_STATE_SYNC=true temporarily to align state.')
            }

            // Try migration again after state sync
            try {
                await migrate(db, { migrationsFolder: './src/app/db/migrations' })
                console.log('✅ Migration completed after state sync')
                return
            } catch (retryError: any) {
                console.log('⚠️  Migration still failing, attempting schema mismatch handling...')
                await handleSchemaMismatch()

                // Final attempt - if this fails, let it fail with proper error
                try {
                    await migrate(db, { migrationsFolder: './src/app/db/migrations' })
                    console.log('✅ Migration completed after basic table setup')
                    return
                } catch (finalError: any) {
                    console.log('💡 Migration still failing - recommended steps:')
                    console.log('   1. Run `bun run db:generate` to create new migrations for schema differences')
                    console.log('   2. Then run `bun run db:migrate` to apply them')
                    console.log('   3. If DB existed before Drizzle, set ALLOW_MIGRATION_STATE_SYNC=true and rerun smart migrate')
                    throw finalError
                }
            }
        }

    } catch (error) {
        console.error('❌ Smart migration failed:', error)
        throw error
    }
}

async function syncMigrationState() {
  try {
    // Get all migration entries (supports both legacy .sql files and folder-based migrations)
    const migrationsDir = join(process.cwd(), 'src/app/db/migrations')
    const entries = await readdir(migrationsDir, { withFileTypes: true })

    const migrationEntries = entries
      .filter((entry) => {
        if (entry.isFile()) return entry.name.endsWith('.sql')
        if (entry.isDirectory()) return /^\d+_.+/.test(entry.name)
        return false
      })
      .sort((a, b) => a.name.localeCompare(b.name))

    // Check which tables actually exist
    const existingTables = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `)

    const tableNames = existingTables.map((row: any) => row.table_name)

    // If we have tables, ensure migration tracking is set up
    if (tableNames.length > 0) {
      await db.execute(sql`CREATE SCHEMA IF NOT EXISTS drizzle`)

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
          id SERIAL PRIMARY KEY,
          hash text NOT NULL,
          created_at bigint
        )
      `)

      const existingMigrations = await db.execute(sql`
        SELECT hash, created_at FROM drizzle.__drizzle_migrations
      `)
      const appliedHashes = new Set(existingMigrations.map((row: any) => row.hash))
      const appliedCreatedAt = new Set(existingMigrations.map((row: any) => Number(row.created_at)))

      // Mark missing migrations as applied (opt-in).
      // Drizzle decides what to run using created_at (folderMillis), and also stores hash.
      for (const entry of migrationEntries) {
        const migrationName = entry.name.replace(/\.sql$/, '')
        const migrationSqlPath = entry.isDirectory()
          ? join(migrationsDir, entry.name, 'migration.sql')
          : join(migrationsDir, entry.name)
        const folderMillis = getMigrationFolderMillis(migrationName)

        if (folderMillis === null) {
          console.log(`Skipping ${migrationName}: cannot parse migration timestamp from name`)
          continue
        }

        let migrationHash: string
        try {
          const migrationSql = await readFile(migrationSqlPath, 'utf8')
          migrationHash = createHash('sha256').update(migrationSql).digest('hex')
        } catch {
          console.log(`Skipping ${migrationName}: cannot read migration SQL file`)
          continue
        }

        if (!appliedHashes.has(migrationHash) || !appliedCreatedAt.has(folderMillis)) {
          await db.execute(sql`
            INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
            VALUES (${migrationHash}, ${folderMillis})
          `)
          console.log(`Marked ${migrationName} as applied`)
        }
      }
    }
  } catch (error) {
    console.error('Error syncing migration state:', error)
    throw error
  }
}

function getMigrationFolderMillis(migrationName: string): number | null {
  const dateStr = migrationName.slice(0, 14)
  if (!/^\d{14}$/.test(dateStr)) return null

  const year = Number(dateStr.slice(0, 4))
  const month = Number(dateStr.slice(4, 6)) - 1
  const day = Number(dateStr.slice(6, 8))
  const hour = Number(dateStr.slice(8, 10))
  const minute = Number(dateStr.slice(10, 12))
  const second = Number(dateStr.slice(12, 14))

  return Date.UTC(year, month, day, hour, minute, second)
}

async function handleSchemaMismatch() {
    try {
        console.log('🔍 Checking for schema mismatches - using latest migration as reference...')

        // Instead of hardcoding, let's just generate a new migration and see what's different
        console.log('💡 Smart approach: Let Drizzle handle schema differences automatically')
        console.log('   - Run `bun run db:generate` to create migrations for new schema changes')
        console.log('   - The system will then apply them automatically')

        // Only for development/bootstrap when explicitly allowed
        if (allowBootstrap) {
            console.log('🧪 Dev bootstrap enabled: Ensuring basic tables exist')
            await ensureBasicTablesExist()
        } else {
            console.log('🚫 Skipping runtime schema bootstrap (safe default).')
            console.log('   - Generate migrations: bun run db:generate')
            console.log('   - Apply migrations: bun run db:migrate')
        }

    } catch (error) {
        console.error('Error handling schema mismatch:', error)
        throw error
    }
}

async function ensureBasicTablesExist() {
    try {
        // Only ensure the most critical tables exist with basic structure
        // Let Drizzle migrations handle the rest

        const criticalTables = [
            {
                name: 'users',
                createSql: `
          CREATE TABLE IF NOT EXISTS users (
            id serial PRIMARY KEY,
            email varchar(255) NOT NULL UNIQUE,
            password varchar(255),
            full_name varchar(200),
            username varchar(100) UNIQUE,
            role_id integer,
            organization_name varchar(100),
            is_active boolean DEFAULT true,
            is_email_verified boolean DEFAULT false,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
          )
        `
            },
            {
                name: 'user_roles',
                createSql: `
          CREATE TABLE IF NOT EXISTS user_roles (
            id serial PRIMARY KEY,
            name varchar(100) NOT NULL UNIQUE,
            display_name varchar(200),
            description text,
            created_by varchar(100),
            organization_name varchar(100),
            is_active boolean DEFAULT true,
            is_system boolean DEFAULT false,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
          )
        `
            }
        ]

        for (const table of criticalTables) {
            try {
                await db.execute(sql.raw(table.createSql))
                console.log(`✓ Ensured ${table.name} table exists`)
            } catch (error) {
                console.log(`- Table ${table.name} already exists`)
            }
        }

    } catch (error) {
        console.error('Error ensuring basic tables:', error)
    }
}

// Apply idempotent fixes using migrationHelpers to avoid common mismatch errors
async function preflightEnsureSchema() {
    // Organizations table (basic) and org-related columns on users and user_roles
    try {
        // Create organizations table if missing
        await db.execute(sql`CREATE TABLE IF NOT EXISTS organizations (
            id serial PRIMARY KEY,
            name text NOT NULL UNIQUE,
            description text,
            logo text,
            subscription_id text,
            parent_org_name text,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        )`)

        // Add self FK on organizations.parent_org_name -> organizations.name
        const addParentFk = migrationHelpers.addConstraintIfNotExists(
            'organizations',
            'organizations_parent_org_name_fkey',
            'FOREIGN KEY (parent_org_name) REFERENCES organizations(name) ON UPDATE CASCADE ON DELETE SET NULL'
        )
        await db.execute(sql.raw(addParentFk))

        // Ensure users.organization_name
        const addUserOrg = migrationHelpers.addColumnIfNotExists('users', 'organization_name', 'varchar(100)')
        await db.execute(sql.raw(addUserOrg))

        // Ensure user_roles.created_by and organization_name
        const addRoleCreatedBy = migrationHelpers.addColumnIfNotExists('user_roles', 'created_by', 'varchar(100)')
        const addRoleOrg = migrationHelpers.addColumnIfNotExists('user_roles', 'organization_name', 'varchar(100)')
        await db.execute(sql.raw(addRoleCreatedBy))
        await db.execute(sql.raw(addRoleOrg))
    } catch (e) {
        // Preflight is best-effort; log and continue
        console.log('ℹ️ Preflight ensure skipped or partially applied:', (e as any)?.message || e)
    }
}

// Dynamic function to ensure all schema tables and columns exist
async function ensureCriticalTablesExist() {
    try {
        console.log('🔍 Checking for missing tables and columns from schema...')
        
        // Get existing tables and their columns
        const existingTablesResult = await db.execute(sql`
            SELECT 
                t.table_name,
                c.column_name,
                c.data_type,
                c.is_nullable,
                c.column_default
            FROM information_schema.tables t
            LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
            WHERE t.table_schema = 'public' AND c.table_schema = 'public'
            ORDER BY t.table_name, c.ordinal_position
        `)
        
        // Group by table name
        const existingSchema: Record<string, Set<string>> = {}
        for (const row of existingTablesResult) {
            const tableName = (row as any).table_name
            const columnName = (row as any).column_name
            
            if (!existingSchema[tableName]) {
                existingSchema[tableName] = new Set()
            }
            if (columnName) {
                existingSchema[tableName].add(columnName)
            }
        }
        
        // Get all table definitions from schema dynamically
        const schemaTableConfigs = []
        for (const [key, value] of Object.entries(schema)) {
            // Check if this is a table (has getTableConfig method)
            if (value && typeof value === 'object' && 'getSQL' in value) {
                try {
                    const config = getTableConfig(value as any)
                    schemaTableConfigs.push(config)
                } catch (e) {
                    // Skip if not a table
                    continue
                }
            }
        }
        
        console.log(` Found ${schemaTableConfigs.length} tables in schema`)
        
        let missingTables = 0
        let missingColumns = 0
        
        for (const tableConfig of schemaTableConfigs) {
            const tableName = tableConfig.name
            const columns = tableConfig.columns
            
            // Check if table exists
            if (!existingSchema[tableName]) {
                console.log(`  Missing table: ${tableName}`)
                // For missing tables, let Drizzle migrations handle creation
                // We'll just log it for now
                missingTables++
                continue
            }
            
            // Check for missing columns in existing table
            const existingColumns = existingSchema[tableName]
            for (const column of columns) {
                const columnName = column.name
                
                if (!existingColumns.has(columnName)) {
                    console.log(`  Missing column: ${tableName}.${columnName}`)
                    
                    // Try to add the missing column
                    try {
                        // Get column type from Drizzle column definition
                        const columnType = getColumnTypeFromDrizzle(column)
                        const addColumnSql = migrationHelpers.addColumnIfNotExists(tableName, columnName, columnType)
                        await db.execute(sql.raw(addColumnSql))
                        console.log(` Added missing column: ${tableName}.${columnName}`)
                        missingColumns++
                    } catch (error: any) {
                        console.log(` Failed to add column ${tableName}.${columnName}:`, error.message)
                    }
                }
            }
        }
        
        if (missingTables > 0 || missingColumns > 0) {
            console.log(` Schema check complete: ${missingTables} missing tables, ${missingColumns} missing columns fixed`)
            if (missingTables > 0) {
                console.log(' Run `bun run db:generate` to create migrations for missing tables')
            }
        } else {
            console.log(' All schema tables and columns exist')
        }
        
    } catch (error) {
        console.error('Error checking schema completeness:', error)
        // Don't throw - this is best effort
    }
}

// Helper function to convert Drizzle column type to SQL type
function getColumnTypeFromDrizzle(column: any): string {
    const columnType = column.columnType
    
    // Handle common Drizzle types
    if (columnType.includes('serial')) return 'serial'
    if (columnType.includes('varchar')) {
        const match = columnType.match(/varchar\((\d+)\)/)
        return match ? `varchar(${match[1]})` : 'varchar(255)'
    }
    if (columnType.includes('text')) return 'text'
    if (columnType.includes('boolean')) return 'boolean'
    if (columnType.includes('timestamp')) return 'timestamp'
    if (columnType.includes('integer')) return 'integer'
    if (columnType.includes('jsonb')) return 'jsonb'
    if (columnType.includes('integer[]')) return 'integer[]'
    
    // Default fallback
    return 'text'
}

// Run if called directly
if (require.main === module) {
    smartMigrate()
        .then(() => {
            console.log('Smart migration completed successfully')
            process.exit(0)
        })
        .catch((error) => {
            console.error('Smart migration failed:', error)
            process.exit(1)
        })
}

