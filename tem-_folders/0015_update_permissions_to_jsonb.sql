-- Migration: Update roles_permission table columns from text to jsonb
-- This allows proper array storage and querying for permission arrays

-- First, convert existing JSON strings to proper JSONB arrays
-- Handle null values and invalid JSON gracefully

-- Update api_permissions column
ALTER TABLE roles_permission 
ALTER COLUMN api_permissions TYPE jsonb 
USING CASE 
  WHEN api_permissions IS NULL THEN NULL
  WHEN api_permissions = '' THEN NULL
  ELSE api_permissions::jsonb
END;

-- Update component_permissions column  
ALTER TABLE roles_permission 
ALTER COLUMN component_permissions TYPE jsonb 
USING CASE 
  WHEN component_permissions IS NULL THEN NULL
  WHEN component_permissions = '' THEN NULL
  ELSE component_permissions::jsonb
END;

-- Update navigation_permissions column
ALTER TABLE roles_permission 
ALTER COLUMN navigation_permissions TYPE jsonb 
USING CASE 
  WHEN navigation_permissions IS NULL THEN NULL
  WHEN navigation_permissions = '' THEN NULL
  ELSE navigation_permissions::jsonb
END;