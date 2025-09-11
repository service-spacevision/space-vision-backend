-- Create sync_state table for generic sync cursors
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
);

-- Ensure unique constraint per (source, partition_key)
CREATE UNIQUE INDEX IF NOT EXISTS sync_state_source_partition_unique
  ON sync_state (source, partition_key);

