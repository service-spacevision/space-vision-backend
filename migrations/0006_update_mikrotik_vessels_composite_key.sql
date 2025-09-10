-- Drop the existing unique constraint on vessel_name
ALTER TABLE mikrotik_vessels 
DROP CONSTRAINT IF EXISTS mikrotik_vessels_vessel_name_unique;

-- Add a new composite unique constraint
ALTER TABLE mikrotik_vessels
ADD CONSTRAINT mikrotik_vessels_name_ip_port_unique 
UNIQUE (vessel_name, router_ip, port);
