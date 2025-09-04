-- Drop all existing primary key constraints and add composite primary key
DO $$ 
DECLARE 
    pk_constraint_name text;
BEGIN
    -- Find and drop existing primary key constraint
    SELECT tc.constraint_name INTO pk_constraint_name
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'starlink_usage'
      AND tc.constraint_type = 'PRIMARY KEY';
    
    IF pk_constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE starlink_usage DROP CONSTRAINT ' || pk_constraint_name;
    END IF;
    
    -- Add composite primary key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc2
        WHERE tc2.table_schema = 'public' 
        AND tc2.table_name = 'starlink_usage' 
        AND tc2.constraint_name = 'starlink_usage_date_key_kit_number_pk'
    ) THEN
        ALTER TABLE starlink_usage ADD CONSTRAINT starlink_usage_date_key_kit_number_pk PRIMARY KEY(date_key, kit_number);
    END IF;
END $$;--> statement-breakpoint

-- Add columns if they don't exist
DO $$ 
BEGIN
    -- Add token column to sessions if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'token') THEN
        ALTER TABLE sessions ADD COLUMN token varchar(255);
    END IF;
    
    -- Add usage_limit_gb column to starlink_usage if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'starlink_usage' AND column_name = 'usage_limit_gb') THEN
        ALTER TABLE starlink_usage ADD COLUMN usage_limit_gb real;
    END IF;
    
    -- Add public_ip_enabled column to starlink_usage if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'starlink_usage' AND column_name = 'public_ip_enabled') THEN
        ALTER TABLE starlink_usage ADD COLUMN public_ip_enabled boolean;
    END IF;
END $$;--> statement-breakpoint

-- Add unique constraint on id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'starlink_usage' 
        AND constraint_name = 'starlink_usage_id_unique'
    ) THEN
        ALTER TABLE starlink_usage ADD CONSTRAINT starlink_usage_id_unique UNIQUE(id);
    END IF;
END $$;