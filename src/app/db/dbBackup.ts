import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'

function backupDatabase() {
  console.log('🔄 Starting database backup from Docker container...')
  
  // Ensure backup directory exists
  const backupDir = path.resolve('./backups')
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  // Create timestamped backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const backupPath = path.resolve(`./backups/space_vision_${timestamp}.sql`)
  const latestBackupPath = path.resolve('./backups/space_vision_latest.sql')

  // Backup command - adjust container name and credentials as needed
  const command = `docker exec -t dbs-postgres-1 pg_dump --create -U root space_vision > ${backupPath}`

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error during backup: ${error.message}`)
      console.log('💡 Make sure Docker container "postgres" is running')
      console.log('💡 Adjust container name and credentials in the script if needed')
      return
    }

    // Copy to latest backup
    try {
      fs.copyFileSync(backupPath, latestBackupPath)
      
      console.log('✅ Database backup successful!')
      console.log(`📁 Timestamped backup: ${backupPath}`)
      console.log(`📁 Latest backup: ${latestBackupPath}`)
      
      // Show backup size
      const stats = fs.statSync(backupPath)
      console.log(`📊 Backup size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
    } catch (copyError) {
      console.error('❌ Error copying backup file:', copyError)
    }
  })
}

backupDatabase()