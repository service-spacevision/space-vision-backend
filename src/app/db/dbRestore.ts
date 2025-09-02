import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'

function restoreDatabase() {
  console.log('🔄 Starting database restore from Docker container...')
  
  const backupPath = path.resolve('./backups/space_vision_latest.sql')
  
  // Check if backup file exists
  if (!fs.existsSync(backupPath)) {
    console.error('❌ Backup file not found:', backupPath)
    console.log('💡 Run "bun run db:backup" first to create a backup')
    return
  }

  console.log(`📁 Restoring from: ${backupPath}`)

  // Restore command - adjust container name and credentials as needed
  const command = `docker exec -i dbs-postgres-1 psql -U root -d postgres < ${backupPath}`

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error during restore: ${error.message}`)
      console.log('💡 Make sure Docker container "postgres" is running')
      console.log('💡 Adjust container name and credentials in the script if needed')
      return
    }

    console.log('✅ Database restore successful!')
    console.log('🚀 You can now run "bun run dev" to start the application')
  })
}

restoreDatabase()