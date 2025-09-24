import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { DATABASE_CONFIG } from '../constants/constants'
import * as schema from './schema'

// Create postgres client
console.log("db.configUrl", DATABASE_CONFIG.DATABASE_URL);

const client = postgres(DATABASE_CONFIG.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10
})

// Create drizzle instance with schema
const dbConfig = {
  schema,
  // Disable schema verification to prevent enum creation errors
  logger: false
} as const

export const db = drizzle(client, dbConfig)

export const connectDatabase = async (): Promise<void> => {
  try {
    // Test connection
    await client`SELECT 1`
    console.log('✅ PostgreSQL connected successfully')
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error)
    throw error
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connection...')
  await client.end()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Closing database connection...')
  await client.end()
  process.exit(0)
})