import postgres from 'postgres';
import { DATABASE_CONFIG } from '../src/app/constants/constants';

async function executeQuery(client: any, query: string, task: string) {
  try {
    await client.unsafe(query);
    console.log(`✅ ${task}`);
    return true;
  } catch (error) {
    console.error(`❌ Error ${task.toLowerCase()}:`, error);
    return false;
  }
}

async function createGroupAccessTable() {
  const client = postgres(DATABASE_CONFIG.DATABASE_URL);
  
  try {
    console.log('Starting group_access table creation...');
    
    // Create table
    await executeQuery(
      client,
      `CREATE TABLE IF NOT EXISTS group_access (
        id SERIAL PRIMARY KEY,
        role INTEGER NOT NULL,
        group_id INTEGER[] NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      'Created group_access table'
    );
    
    // Add comments
    await executeQuery(
      client, 
      "COMMENT ON TABLE group_access IS 'Stores group access permissions for different roles';",
      'Added table comment'
    );
    
    await executeQuery(
      client,
      "COMMENT ON COLUMN group_access.role IS 'Role ID that has access to the groups';",
      'Added role column comment'
    );
    
    await executeQuery(
      client,
      "COMMENT ON COLUMN group_access.group_id IS 'Array of group IDs that the role has access to';",
      'Added group_id column comment'
    );
    
    // Create indexes
    await executeQuery(
      client,
      'CREATE INDEX IF NOT EXISTS idx_group_access_role ON group_access(role);',
      'Created index on role column'
    );
    
    await executeQuery(
      client,
      'CREATE INDEX IF NOT EXISTS idx_group_access_group_id ON group_access USING GIN (group_id);',
      'Created GIN index on group_id array'
    );
    
    console.log('\n🎉 group_access table setup completed!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    await client.end();
  }
}

createGroupAccessTable();
