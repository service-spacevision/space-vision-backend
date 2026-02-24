ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "created_by" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_by" varchar(100);