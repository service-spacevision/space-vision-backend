import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as schema from './schema';
import { URL } from 'url';

const envPath = join(process.cwd(), '.env');
if (existsSync(envPath)) {
  try {
    const raw = readFileSync(envPath, 'utf8');
    const match = raw.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m);
    if (match?.[1]) {
      const value = match[1].trim().replace(/^['"]|['"]$/g, '');
      process.env.DATABASE_URL = value;
    }
  } catch {}
}

// Create postgres client with Neon configuration
const databaseUrl =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/elysia_db';

try {
  const u = new URL(databaseUrl);
  console.log(
    `🔌 DB target: ${u.username}@${u.hostname}:${u.port || '(default)'}/${u.pathname.replace(/^\//, '')}`,
  );
} catch {}

export const sql = postgres(databaseUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  // ssl: 'require', // Required for Neon
  transform: {
    undefined: null, // Convert undefined to null for better compatibility
  },
});

// Create drizzle instance with schema
export const db = drizzle({
  client: sql,
  schema,
  logger: process.env.NODE_ENV === 'development',
});

console.log('✅ Database connection initialized');

export const connectDatabase = async (): Promise<void> => {
  try {
    // Test connection
    await sql`SELECT 1`;
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    throw error;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connection...');
  await sql.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing database connection...');
  await sql.end();
  process.exit(0);
});
