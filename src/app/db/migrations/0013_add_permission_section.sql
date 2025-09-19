-- Add permission_section enum and column to permissions table

-- Create permission_section enum if it doesn't exist
DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'permission_section' AND n.nspname = 'public'
    ) THEN
        CREATE TYPE permission_section AS ENUM ('admin', 'organization');
    END IF;
END $;

-- Add section column to permissions table if it doesn't exist
DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'permissions' 
        AND column_name = 'section'
    ) THEN
        ALTER TABLE "permissions" ADD COLUMN "section" "permission_section" DEFAULT 'organization';
    END IF;
END $;