-- Idempotent fix: ensure enums and permissions table exist

-- Create enum types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'permission_scope' AND n.nspname = 'public'
    ) THEN
        CREATE TYPE permission_scope AS ENUM ('own', 'organization', 'all');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'permission_category' AND n.nspname = 'public'
    ) THEN
        CREATE TYPE permission_category AS ENUM ('navigation', 'component', 'api');
    END IF;
END $$;

-- Create permissions table if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'permissions'
    ) THEN
        CREATE TABLE "permissions" (
            "id" serial PRIMARY KEY NOT NULL,
            "name" varchar(255) NOT NULL,
            "resource" varchar(255) NOT NULL,
            "action" varchar(100) NOT NULL,
            "scope" "permission_scope" DEFAULT 'own',
            "category" "permission_category" NOT NULL,
            "description" text,
            "created_at" timestamp DEFAULT now(),
            "updated_at" timestamp DEFAULT now(),
            CONSTRAINT "permissions_name_unique" UNIQUE("name")
        );
    END IF;
END $$;

