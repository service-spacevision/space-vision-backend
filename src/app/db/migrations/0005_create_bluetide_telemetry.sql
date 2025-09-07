-- Create the bluetide_telemetry table
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
);

-- Add a comment to the table
COMMENT ON TABLE bluetide_telemetry IS 'Stores telemetry data for Bluetide devices';
