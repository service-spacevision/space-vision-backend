-- Add section column to permissions table
ALTER TABLE permissions 
ADD COLUMN section VARCHAR(255) NOT NULL DEFAULT 'organization';

-- Update existing permissions with default section
UPDATE permissions 
SET section = 'organization' 
WHERE section IS NULL;
