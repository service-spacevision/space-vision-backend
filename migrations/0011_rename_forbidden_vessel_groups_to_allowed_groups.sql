-- Rename the column from forbidden_vessel_groups to allowed_groups
ALTER TABLE user_roles RENAME COLUMN forbidden_vessel_groups TO allowed_groups;

-- Update the type to be more explicit about the allowed groups
ALTER TABLE user_roles ALTER COLUMN allowed_groups TYPE integer[] USING COALESCE(allowed_groups, ARRAY[]::integer[]);
