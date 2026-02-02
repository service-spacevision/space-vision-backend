import { sql } from 'drizzle-orm'
import { db } from './connection'

export async function ensureSyncState() {
  // Create table and unique index if they do not exist
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sync_state (
      id SERIAL PRIMARY KEY,
      source TEXT NOT NULL,
      partition_key TEXT NOT NULL DEFAULT 'default',
      cursor_type TEXT NOT NULL DEFAULT 'timestamp',
      cursor_value TEXT,
      last_synced_at TIMESTAMPTZ,
      meta JSONB,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `)

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS sync_state_source_partition_unique
    ON sync_state (source, partition_key)
  `)
}

