-- Add organization_id column to user_roles table
ALTER TABLE user_roles
ADD COLUMN IF NOT EXISTS organization_id VARCHAR(100);

-- Add a comment to describe the column
COMMENT ON COLUMN user_roles.organization_id IS 'References the organization this role belongs to';

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_roles_organization_id ON user_roles(organization_id);
