ALTER TABLE "user_roles" ADD COLUMN "allowed_groups" integer[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_roles" DROP COLUMN "forbidden_vessel_groups";