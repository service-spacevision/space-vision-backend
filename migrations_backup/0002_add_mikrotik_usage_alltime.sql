-- Create the all-time usage table
CREATE TABLE IF NOT EXISTS mikrotik_usage_alltime (
  id SERIAL PRIMARY KEY,
  vessel_name TEXT NOT NULL,
  username TEXT NOT NULL,
  uptime TEXT,
  rx_mb INTEGER NOT NULL DEFAULT 0,
  tx_mb INTEGER NOT NULL DEFAULT 0,
  total_allowed_mb INTEGER NOT NULL DEFAULT 5000,
  percentage_used NUMERIC(5,1) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vessel_name, username)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mikrotik_usage_alltime_vessel ON mikrotik_usage_alltime(vessel_name);
CREATE INDEX IF NOT EXISTS idx_mikrotik_usage_alltime_username ON mikrotik_usage_alltime(username);

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mikrotik_usage_alltime_updated_at
BEFORE UPDATE ON mikrotik_usage_alltime
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add a comment to the table
COMMENT ON TABLE mikrotik_usage_alltime IS 'Stores cumulative usage statistics for Mikrotik hotspot users across all sessions';

-- Add comments to columns
COMMENT ON COLUMN mikrotik_usage_alltime.vessel_name IS 'Name of the vessel this data belongs to';
COMMENT ON COLUMN mikrotik_usage_alltime.username IS 'Username of the hotspot user';
COMMENT ON COLUMN mikrotik_usage_alltime.uptime IS 'Total uptime of the user';
COMMENT ON COLUMN mikrotik_usage_alltime.rx_mb IS 'Total received data in MB';
COMMENT ON COLUMN mikrotik_usage_alltime.tx_mb IS 'Total transmitted data in MB';
COMMENT ON COLUMN mikrotik_usage_alltime.total_allowed_mb IS 'Total allowed data in MB (default: 5000MB)';
COMMENT ON COLUMN mikrotik_usage_alltime.percentage_used IS 'Percentage of allowed data used (0-100)';
COMMENT ON COLUMN mikrotik_usage_alltime.last_updated IS 'When this record was last updated from the router';

-- Grant necessary permissions (adjust as needed for your security model)
-- GRANT SELECT, INSERT, UPDATE ON mikrotik_usage_alltime TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE mikrotik_usage_alltime_id_seq TO your_app_user;
