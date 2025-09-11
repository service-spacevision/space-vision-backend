import { sql } from 'drizzle-orm'
import { db } from './connection'

export async function ensureBluetideTelemetry() {
  // Enable required extensions (safe if already present)
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS cube`)
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS earthdistance`)

  // Create table if missing
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS bluetide_telemetry (
      id SERIAL PRIMARY KEY,
      account_number TEXT NOT NULL,
      device_id TEXT NOT NULL,
      "timestamp" TIMESTAMPTZ NOT NULL,
      downlink_throughput_mbps REAL,
      uplink_throughput_mbps REAL,
      ping_drop_rate_avg REAL,
      ping_latency_ms_avg INTEGER,
      obstruction_percent_time REAL,
      uptime_seconds INTEGER,
      signal_quality_percent REAL,
      h3_cell_id TEXT,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      seconds_until_swupdate_reboot_possible INTEGER,
      running_software_version TEXT,
      active_alert_count INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  // Unique index to support ON CONFLICT (device_id, timestamp)
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS bluetide_telemetry_device_timestamp_unique
    ON bluetide_telemetry (device_id, "timestamp")
  `)

  // Common indexes
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_bluetide_telemetry_device_id ON bluetide_telemetry(device_id)
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_bluetide_telemetry_timestamp ON bluetide_telemetry("timestamp")
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_bluetide_telemetry_device_timestamp
    ON bluetide_telemetry(device_id, "timestamp" DESC)
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_bluetide_telemetry_account ON bluetide_telemetry(account_number)
  `)

  // Geo index (requires extensions above)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_bluetide_telemetry_location
    ON bluetide_telemetry USING GIST (ll_to_earth(latitude, longitude))
  `)
}

