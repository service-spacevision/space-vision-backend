CREATE TYPE "public"."permission_category" AS ENUM('navigation', 'component', 'api');--> statement-breakpoint
CREATE TYPE "public"."permission_scope" AS ENUM('own', 'organization', 'all');--> statement-breakpoint
CREATE TYPE "public"."permission_section" AS ENUM('admin', 'organization');--> statement-breakpoint
ALTER TABLE "user_roles" ALTER COLUMN "allowed_groups" SET DEFAULT ARRAY[]::integer[];--> statement-breakpoint
ALTER TABLE "user_roles" ALTER COLUMN "allowed_groups" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "permitted_vessel_groups" integer[];--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "section" "permission_section" DEFAULT 'organization';