-- Rename the column from allowed_groups to permitted_vessel_groups
ALTER TABLE user_roles RENAME COLUMN allowed_groups TO permitted_vessel_groups;

-- Ensure the column has the correct type and default value
ALTER TABLE user_roles 
ALTER COLUMN permitted_vessel_groups 
SET DEFAULT '{}'::integer[],
SET NOT NULL;
