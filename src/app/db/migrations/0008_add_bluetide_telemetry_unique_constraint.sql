-- Add a unique constraint on device_id and timestamp
ALTER TABLE bluetide_telemetry
ADD CONSTRAINT bluetide_telemetry_device_id_timestamp_key 
UNIQUE (device_id, timestamp);

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_bluetide_telemetry_device_timestamp 
ON bluetide_telemetry(device_id, timestamp DESC);
