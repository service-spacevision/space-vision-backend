-- Add section column to permissions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'permissions' 
        AND column_name = 'section'
    ) THEN
        ALTER TABLE "permissions" 
        ADD COLUMN "section" varchar(50) NOT NULL DEFAULT 'organization';
        
        -- Update existing records to have a default section
        UPDATE "permissions" 
        SET "section" = 'organization' 
        WHERE "section" IS NULL;
        
        RAISE NOTICE 'Added section column to permissions table';
    ELSE
        RAISE NOTICE 'Section column already exists in permissions table';
    END IF;
END $$;
