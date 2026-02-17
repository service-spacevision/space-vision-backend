import { db } from '../src/app/db/connection';
import { sql } from 'drizzle-orm';

async function listTables() {
  try {
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Tables in database:');
    console.table(result.rows);
    process.exit(0);
  } catch (error) {
    console.error('Error listing tables:', error);
    process.exit(1);
  }
}

listTables();
