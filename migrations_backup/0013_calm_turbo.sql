DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_category') THEN
        CREATE TYPE "public"."permission_category" AS ENUM('navigation', 'component', 'api');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_scope') THEN
        CREATE TYPE "public"."permission_scope" AS ENUM('own', 'organization', 'all');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_section') THEN
        CREATE TYPE "public"."permission_section" AS ENUM('admin', 'organization');
    END IF;
END $$;--> statement-breakpoint
ALTER TABLE "user_roles" ALTER COLUMN "allowed_groups" SET DEFAULT ARRAY[]::integer[];--> statement-breakpoint
ALTER TABLE "user_roles" ALTER COLUMN "allowed_groups" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "permitted_vessel_groups" integer[];--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "section" "permission_section" DEFAULT 'organization';