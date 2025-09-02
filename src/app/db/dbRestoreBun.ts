import { $ } from "bun"
import { access } from "fs/promises"

async function restoreDatabase() {
  try {
    console.log('🔄 Starting database restore from Docker container...')
    
    const backupPath = './backups/space_vision_latest.sql'
    
    // Check if backup file exists
    try {
      await access(backupPath)
    } catch {
      console.error('❌ Backup file not found:', backupPath)
      console.log('💡 Run "bun run db:backup" first to create a backup')
      process.exit(1)
    }

    console.log(`📁 Restoring from: ${backupPath}`)

    // Restore command - adjust container name and credentials as needed
    await $`docker exec -i dbs-postgres-1 psql -U root -d postgres < ${backupPath}`

    console.log('✅ Database restore successful!')
    console.log('🚀 You can now run "bun run dev" to start the application')

  } catch (error: any) {
    console.error('❌ Error during restore:', error.message)
    console.log('💡 Make sure Docker container "postgres" is running')
    console.log('💡 Adjust container name and credentials in the script if needed')
    process.exit(1)
  }
}

restoreDatabase()