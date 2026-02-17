-- Add permitted_vessel_groups column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_roles' AND column_name = 'permitted_vessel_groups') THEN
        -- Add the column with the correct type and default value
        ALTER TABLE user_roles 
        ADD COLUMN permitted_vessel_groups integer[] DEFAULT '{}'::integer[] NOT NULL;
        
        -- If allowed_groups exists, copy its data to permitted_vessel_groups
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_roles' AND column_name = 'allowed_groups') THEN
            UPDATE user_roles 
            SET permitted_vessel_groups = COALESCE(allowed_groups, '{}'::integer[]);
        END IF;
        
        RAISE NOTICE 'Added permitted_vessel_groups column';
    ELSE
        RAISE NOTICE 'permitted_vessel_groups column already exists';
    END IF;
END
$$;
