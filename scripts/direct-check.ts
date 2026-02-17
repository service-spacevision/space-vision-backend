import postgres from 'postgres';
import { DATABASE_CONFIG } from '../src/app/constants/constants';

async function checkDatabase() {
  const client = postgres(DATABASE_CONFIG.DATABASE_URL);
  
  try {
    // List all tables in the public schema
    const tables = await client`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    
    console.log('Tables in database:');
    console.table(tables);
    
    // Check if group_access exists
    const groupAccessExists = await client`
      SELECT EXISTS (
        SELECT 1 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'group_access'
      ) as exists;
    `;
    
    console.log('\nDoes group_access table exist?', groupAccessExists[0].exists);
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

checkDatabase();
