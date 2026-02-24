DO $$ BEGIN
  CREATE TYPE "public"."permission_category" AS ENUM('navigation', 'component', 'api');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."permission_scope" AS ENUM('own', 'organization', 'all');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."permission_section" AS ENUM('admin', 'organization');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;