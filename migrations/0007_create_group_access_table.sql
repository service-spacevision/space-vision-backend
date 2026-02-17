-- Create group_access table
CREATE TABLE IF NOT EXISTS group_access (
  id SERIAL PRIMARY KEY,
  role INTEGER NOT NULL,
  group_id INTEGER[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for better documentation
COMMENT ON TABLE group_access IS 'Stores group access permissions for different roles';
COMMENT ON COLUMN group_access.role IS 'Role ID that has access to the groups';
COMMENT ON COLUMN group_access.group_id IS 'Array of group IDs that the role has access to';

-- Create an index on role for faster lookups
CREATE INDEX IF NOT EXISTS idx_group_access_role ON group_access(role);

-- Create a GIN index on the group_id array for better array operations
CREATE INDEX IF NOT EXISTS idx_group_access_group_id ON group_access USING GIN (group_id);
