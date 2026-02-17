-- Add permitted_vessel_groups column to permissions table
DO $$
BEGIN
    -- Check if the column already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'permissions' 
        AND column_name = 'permitted_vessel_groups'
    ) THEN
        -- Add the column as a JSONB type to store an array of vessel group IDs
        ALTER TABLE permissions 
        ADD COLUMN permitted_vessel_groups JSONB DEFAULT '[]'::jsonb;
        
        -- Initialize existing records with an empty array
        UPDATE permissions 
        SET permitted_vessel_groups = '[]'::jsonb 
        WHERE permitted_vessel_groups IS NULL;
        
        RAISE NOTICE 'Successfully added permitted_vessel_groups column to permissions table';
    ELSE
        RAISE NOTICE 'Column permitted_vessel_groups already exists in permissions table';
    END IF;
END $$;
