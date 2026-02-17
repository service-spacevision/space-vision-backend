-- Add section column to permissions table
DO $$
BEGIN
    -- Check if the column already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'permissions' 
        AND column_name = 'section'
    ) THEN
        -- Add the column with a default value
        ALTER TABLE permissions 
        ADD COLUMN section VARCHAR(50) NOT NULL DEFAULT 'organization';
        
        -- Update existing records to have the default section
        UPDATE permissions 
        SET section = 'organization' 
        WHERE section IS NULL;
        
        RAISE NOTICE 'Successfully added section column to permissions table';
    ELSE
        RAISE NOTICE 'Section column already exists in permissions table';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error adding section column: %', SQLERRM;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'permissions' 
AND column_name = 'section';
