-- Create mikrotik_usage_session table
CREATE TABLE IF NOT EXISTS mikrotik_usage_session (
    id SERIAL PRIMARY KEY,
    vessel_name TEXT NOT NULL,
    username TEXT NOT NULL,
    ip TEXT,
    mac TEXT,
    uptime TEXT,
    rx_mb INTEGER NOT NULL DEFAULT 0,
    tx_mb INTEGER NOT NULL DEFAULT 0,
    total_allowed_mb INTEGER NOT NULL DEFAULT 5000,
    percentage_used DECIMAL(5,1) NOT NULL DEFAULT 0.0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_vessel_name FOREIGN KEY (vessel_name) 
        REFERENCES mikrotik_vessels(vessel_name) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mikrotik_usage_session_vessel 
    ON mikrotik_usage_session(vessel_name);
    
CREATE INDEX IF NOT EXISTS idx_mikrotik_usage_session_username 
    ON mikrotik_usage_session(username);
    
CREATE INDEX IF NOT EXISTS idx_mikrotik_usage_session_last_updated 
    ON mikrotik_usage_session(last_updated);

-- Add comments
COMMENT ON TABLE mikrotik_usage_session IS 'Stores active MikroTik hotspot sessions with usage data';
COMMENT ON COLUMN mikrotik_usage_session.rx_mb IS 'Received data in MB';
COMMENT ON COLUMN mikrotik_usage_session.tx_mb IS 'Transmitted data in MB';
COMMENT ON COLUMN mikrotik_usage_session.percentage_used IS 'Percentage of data limit used (0-100)';
