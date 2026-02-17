import { db } from '../src/app/db/connection';
import { sql } from 'drizzle-orm';

async function addPermittedVesselGroupsColumn() {
  try {
    console.log('Attempting to add permitted_vessel_groups column to organizations table...');
    
    await db.execute(sql`
      ALTER TABLE organizations 
      ADD COLUMN IF NOT EXISTS permitted_vessel_groups INTEGER[] DEFAULT '{}'::INTEGER[];
    `);
    
    console.log('Successfully added permitted_vessel_groups column to organizations table');
  } catch (error) {
    console.error('Error adding permitted_vessel_groups column:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

addPermittedVesselGroupsColumn();
