import { db } from './connection'
import { sql } from 'drizzle-orm'
import { readdir } from 'fs/promises'
import { join } from 'path'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import migrationHelpers from './migrationUtils'

// Controls for dev-only recovery behaviors
const allowBootstrap = process.env.ALLOW_SCHEMA_BOOTSTRAP === 'true' && process.env.NODE_ENV !== 'production'
const allowStateSync = process.env.ALLOW_MIGRATION_STATE_SYNC !== 'false'

export async function smartMigrate() {
    try {
        console.log('🔄 Smart migration system starting...')

        // Preflight: apply idempotent ensures for known schema bits
        await preflightEnsureSchema()

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
                console.log('⚠️  Migration state sync disabled but detected existing relations; consider enabling ALLOW_MIGRATION_STATE_SYNC')
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
                    console.log('💡 Migration still failing - this usually means you need to:')
                    console.log('   1. Run `bun run db:generate` to create new migrations')
                    console.log('   2. Then run `bun run db:migrate` to apply them')
                    console.log('   3. Or restart the server to auto-apply')
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
        // Get all migration files
        const migrationsDir = join(process.cwd(), 'src/app/db/migrations')
        const files = await readdir(migrationsDir)
        const migrationFiles = files
            .filter(file => file.endsWith('.sql'))
            .sort()

        // Check which tables actually exist
        const existingTables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)

        const tableNames = existingTables.map((row: any) => row.table_name)

        // If we have tables, ensure migration tracking is set up
        if (tableNames.length > 0) {
            // Create the drizzle migrations table if it doesn't exist
            await db.execute(sql`CREATE SCHEMA IF NOT EXISTS drizzle`)

            await db.execute(sql`
        CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
          id SERIAL PRIMARY KEY,
          hash text NOT NULL,
          created_at bigint
        )
      `)

            // Get existing migration records
            const existingMigrations = await db.execute(sql`
        SELECT hash FROM drizzle.__drizzle_migrations
      `)
            const appliedMigrations = existingMigrations.map((row: any) => row.hash)

            // Mark missing migrations as applied
            for (const file of migrationFiles) {
                const migrationName = file.replace('.sql', '')
                if (!appliedMigrations.includes(migrationName)) {
                    await db.execute(sql`
            INSERT INTO drizzle.__drizzle_migrations (hash, created_at) 
            VALUES (${migrationName}, ${Date.now()})
          `)
                    console.log(`✓ Marked ${migrationName} as applied`)
                }
            }
        }

    } catch (error) {
        console.error('Error syncing migration state:', error)
        throw error
    }
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

// Removed redundant functions - let Drizzle handle schema changes properly

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
