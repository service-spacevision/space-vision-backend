import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = 'postgresql://root:example@localhost:5432/space_vision'
const sql = postgres(connectionString)
const db = drizzle(sql)

async function checkSchema() {
  try {
    // Check foreign key relationships
    console.log('=== FOREIGN KEY RELATIONSHIPS ===')
    const foreignKeys = await sql`
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name
    `
    foreignKeys.forEach(fk => console.log(`- ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`))
    
    // Test the relationships with sample data
    console.log('\n=== TESTING RELATIONSHIPS ===')
    
    // Check if we have any data
    const vesselGroupsCount = await sql`SELECT COUNT(*) as count FROM vessel_groups`
    const groupAccessCount = await sql`SELECT COUNT(*) as count FROM group_access`
    const vesselsCount = await sql`SELECT COUNT(*) as count FROM vessels`
    
    console.log(`- vessel_groups: ${vesselGroupsCount[0].count} records`)
    console.log(`- group_access: ${groupAccessCount[0].count} records`)
    console.log(`- vessels: ${vesselsCount[0].count} records`)
    
    if (vesselGroupsCount[0].count > 0) {
      console.log('\nSample vessel_groups data:')
      const sampleGroups = await sql`SELECT id, group_name FROM vessel_groups LIMIT 3`
      sampleGroups.forEach(g => console.log(`  - ID: ${g.id}, Name: ${g.group_name}`))
    }
    
    if (groupAccessCount[0].count > 0) {
      console.log('\nSample group_access data:')
      const sampleAccess = await sql`SELECT id, role, group_id FROM group_access LIMIT 3`
      sampleAccess.forEach(ga => console.log(`  - ID: ${ga.id}, Role: ${ga.role}, Group ID: ${ga.group_id}`))
    }
    
    if (vesselsCount[0].count > 0) {
      console.log('\nSample vessels data:')
      const sampleVessels = await sql`SELECT id, vesselskit_number, name, group_id FROM vessels LIMIT 3`
      sampleVessels.forEach(v => console.log(`  - ID: ${v.id}, Kit: ${v.vesselskit_number}, Name: ${v.name}, Group ID: ${v.group_id}`))
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await sql.end()
  }
}

checkSchema()