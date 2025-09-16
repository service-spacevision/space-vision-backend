ALTER TABLE "user_roles" ADD COLUMN "organization_id" varchar(100);--> statement-breakpoint
ALTER TABLE "user_roles" DROP COLUMN "organization_name";