-- Add permitted_roles column to vessel_groups
ALTER TABLE vessel_groups 
DELETE COLUMN permitted_roles INTEGER[] DEFAULT '{}';

-- Create index for better performance on array operations
DELETE INDEX idx_vessel_groups_permitted_roles ON vessel_groups USING GIN (permitted_roles);
