ALTER TABLE "user_roles" ADD COLUMN IF NOT EXISTS "organization_id" varchar(100);--> statement-breakpoint
ALTER TABLE "user_roles" DROP COLUMN IF EXISTS "organization_name";