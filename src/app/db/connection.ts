import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { DATABASE_CONFIG } from '../constants/constants'
import * as schema from './schema'

// Create postgres client with Neon configuration
export const sql = postgres(DATABASE_CONFIG.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  // ssl: 'require', // Required for Neon
  transform: {
    undefined: null // Convert undefined to null for better compatibility
  }
})

// Create drizzle instance with schema
export const db = drizzle(sql, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
})

console.log('✅ Database connection initialized')

export const connectDatabase = async (): Promise<void> => {
  try {
    // Test connection
    await sql`SELECT 1`
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    throw error
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connection...')
  await sql.end()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Closing database connection...')
  await sql.end()
  process.exit(0)
})