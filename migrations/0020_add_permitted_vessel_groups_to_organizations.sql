-- Add permitted_vessel_groups column to organizations table
DO $$
BEGIN
    -- Check if the column already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'organizations' 
        AND column_name = 'permitted_vessel_groups'
    ) THEN
        -- Add the column as an integer array
        ALTER TABLE organizations 
        ADD COLUMN permitted_vessel_groups integer[] DEFAULT '{}';
        
        RAISE NOTICE 'Successfully added permitted_vessel_groups column to organizations table';
    ELSE
        RAISE NOTICE 'permitted_vessel_groups column already exists in organizations table';
    END IF;
END $$;
