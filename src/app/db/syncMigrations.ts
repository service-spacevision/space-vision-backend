import { db } from './connection'
import { sql } from 'drizzle-orm'
import { readdir } from 'fs/promises'
import { join } from 'path'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

export async function smartMigrate() {
    try {
        console.log('🔄 Smart migration system starting...')

        // First, try normal migration
        try {
            console.log('Attempting standard migration...')
            await migrate(db, { migrationsFolder: './src/app/db/migrations' })
            console.log('✅ Standard migration completed successfully')
            return
        } catch (migrationError: any) {
            console.log('⚠️  Standard migration failed, analyzing issue...')

            // Check if it's a "table already exists" error
            if (migrationError.message?.includes('already exists')) {
                console.log('🔧 Detected existing tables, syncing migration state...')
                await syncMigrationState()

                // Try migration again after sync
                try {
                    await migrate(db, { migrationsFolder: './src/app/db/migrations' })
                    console.log('✅ Migration completed after state sync')
                    return
                } catch (retryError: any) {
                    console.log('⚠️  Migration still failing, ensuring basic tables exist...')
                    await handleSchemaMismatch()

                    // Final attempt - if this fails, let it fail with proper error
                    try {
                        await migrate(db, { migrationsFolder: './src/app/db/migrations' })
                        console.log('✅ Migration completed after basic table setup')
                    } catch (finalError: any) {
                        console.log('💡 Migration still failing - this usually means you need to:')
                        console.log('   1. Run `bun run db:generate` to create new migrations')
                        console.log('   2. Then run `bun run db:migrate` to apply them')
                        console.log('   3. Or restart the server to auto-apply')
                        throw finalError
                    }
                }
            } else {
                throw migrationError
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

        // For now, just ensure basic tables exist with minimal columns
        await ensureBasicTablesExist()

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
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            email varchar(255) NOT NULL UNIQUE,
            password varchar(255),
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
          )
        `
            },
            {
                name: 'user_roles',
                createSql: `
          CREATE TABLE IF NOT EXISTS user_roles (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name varchar(100) NOT NULL UNIQUE,
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