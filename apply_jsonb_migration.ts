import { db } from './src/app/db/connection'
import { sql } from 'drizzle-orm'

async function applyJsonbMigration() {
  try {
    console.log('Applying JSONB migration for permissions...')
    
    // Apply the migration manually
    await db.execute(sql`
      -- Update api_permissions column
      ALTER TABLE roles_permission 
      ALTER COLUMN api_permissions TYPE jsonb 
      USING CASE 
        WHEN api_permissions IS NULL THEN NULL
        WHEN api_permissions = '' THEN NULL
        ELSE api_permissions::jsonb
      END
    `)
    
    await db.execute(sql`
      -- Update component_permissions column  
      ALTER TABLE roles_permission 
      ALTER COLUMN component_permissions TYPE jsonb 
      USING CASE 
        WHEN component_permissions IS NULL THEN NULL
        WHEN component_permissions = '' THEN NULL
        ELSE component_permissions::jsonb
      END
    `)
    
    await db.execute(sql`
      -- Update navigation_permissions column
      ALTER TABLE roles_permission 
      ALTER COLUMN navigation_permissions TYPE jsonb 
      USING CASE 
        WHEN navigation_permissions IS NULL THEN NULL
        WHEN navigation_permissions = '' THEN NULL
        ELSE navigation_permissions::jsonb
      END
    `)
    
    console.log('✅ Successfully updated permissions columns to JSONB type')
    
    // Verify the changes
    const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'roles_permission' 
      AND column_name LIKE '%permissions'
    `)
    
    console.log('Updated column types:', result)
    
    // Mark migration as applied
    await db.execute(sql`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at) 
      VALUES ('0015_update_permissions_to_jsonb', ${Date.now()})
      ON CONFLICT (hash) DO NOTHING
    `)
    
    console.log('✅ Migration marked as applied')
    
    // Also remove the permissions column from user_roles table
    console.log('Removing permissions column from user_roles table...')
    await db.execute(sql`ALTER TABLE user_roles DROP COLUMN IF EXISTS permissions`)
    console.log('✅ Removed permissions column from user_roles table')
    
    // Mark the second migration as applied
    await db.execute(sql`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at) 
      VALUES ('0016_remove_permissions_from_user_roles', ${Date.now()})
      ON CONFLICT (hash) DO NOTHING
    `)
    console.log('✅ Second migration marked as applied')
    
  } catch (error) {
    console.error('Error applying migration:', error)
  } finally {
    process.exit(0)
  }
}

applyJsonbMigration()