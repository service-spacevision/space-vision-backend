ALTER TABLE "permissions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "permissions" CASCADE;--> statement-breakpoint
ALTER TABLE "group_access" DROP CONSTRAINT "group_access_group_id_vessel_groups_id_fk";
--> statement-breakpoint
ALTER TABLE "group_access" ALTER COLUMN "role" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "group_access" ALTER COLUMN "group_id" SET DATA TYPE integer[];--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "token" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_roles" ADD COLUMN "permissions" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "user_roles" ADD COLUMN "organization_name" varchar(100);--> statement-breakpoint
ALTER TABLE "user_roles" ADD COLUMN "permitted_vessel_groups" integer[] DEFAULT ARRAY[]::integer[] NOT NULL;--> statement-breakpoint
ALTER TABLE "group_access" DROP COLUMN "updated_at";--> statement-breakpoint
DROP TYPE "public"."permission_category";--> statement-breakpoint
DROP TYPE "public"."permission_scope";--> statement-breakpoint
DROP TYPE "public"."permission_section";