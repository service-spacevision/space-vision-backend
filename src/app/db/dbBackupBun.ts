import { $ } from "bun"
import { mkdir, writeFile, stat } from "fs/promises"

async function backupDatabase() {
  try {
    console.log('🔄 Starting database backup from Docker container...')
    
    // Ensure backup directory exists
    try {
      await mkdir('./backups', { recursive: true })
    } catch {
      // Directory already exists
    }

    // Create timestamped backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const backupPath = `./backups/space_vision_${timestamp}.sql`
    const latestBackupPath = './backups/space_vision_latest.sql'

    console.log(`📁 Creating backup: ${backupPath}`)

    // Backup command - adjust container name and credentials as needed
    const result = await $`docker exec -t dbs-postgres-1 pg_dump --create -U root space_vision`.text()
    
    // Write to both files
    await writeFile(backupPath, result)
    await writeFile(latestBackupPath, result)

    console.log('✅ Database backup successful!')
    console.log(`📁 Timestamped backup: ${backupPath}`)
    console.log(`📁 Latest backup: ${latestBackupPath}`)
    
    // Show backup size
    const stats = await stat(backupPath)
    console.log(`📊 Backup size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)

  } catch (error: any) {
    console.error('❌ Error during backup:', error.message)
    console.log('💡 Make sure Docker container "postgres" is running')
    console.log('💡 Adjust container name and credentials in the script if needed')
    process.exit(1)
  }
}

backupDatabase()