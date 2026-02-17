-- Enable the cube and earthdistance extensions for geospatial queries
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_bluetide_telemetry_device_id ON bluetide_telemetry(device_id);
CREATE INDEX IF NOT EXISTS idx_bluetide_telemetry_timestamp ON bluetide_telemetry("timestamp");
CREATE INDEX IF NOT EXISTS idx_bluetide_telemetry_device_timestamp ON bluetide_telemetry(device_id, "timestamp" DESC);

-- Add index for geospatial queries if needed (using earth_box for better performance)
CREATE INDEX IF NOT EXISTS idx_bluetide_telemetry_location ON bluetide_telemetry USING GIST (ll_to_earth(latitude, longitude));

-- Add index for account-based queries if needed
CREATE INDEX IF NOT EXISTS idx_bluetide_telemetry_account ON bluetide_telemetry(account_number);
