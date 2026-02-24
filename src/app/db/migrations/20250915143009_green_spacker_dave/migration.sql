ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "organization_id" integer;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "organization_name";