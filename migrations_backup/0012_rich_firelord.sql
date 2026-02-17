ALTER TABLE "users" ADD COLUMN "organization_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_by" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_by" varchar(100);--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "organization_name";