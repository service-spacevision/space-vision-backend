import { db } from './connection'
import { readFileSync } from 'fs'
import { join } from 'path'

async function runCustomMigration() {
  try {
    console.log('Running custom migration...')
    
    // Read the custom migration SQL
    const migrationSQL = readFileSync(
      join(__dirname, 'migrations', '0005_update_group_schema.sql'), 
      'utf-8'
    )
    
    // Execute the migration
    await db.execute(migrationSQL)
    
    console.log('✅ Custom migration completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Custom migration failed:', error)
    process.exit(1)
  }
}

runCustomMigration()