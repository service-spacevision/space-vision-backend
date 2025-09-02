ALTER TABLE "group_access" DROP CONSTRAINT IF EXISTS "group_access_group_id_vessel_groups_id_fk";
--> statement-breakpoint
ALTER TABLE "vessels" DROP CONSTRAINT IF EXISTS "vessels_group_id_vessel_groups_id_fk";
--> statement-breakpoint
ALTER TABLE "group_access" DROP CONSTRAINT IF EXISTS "group_access_role_group_id_pk";--> statement-breakpoint
ALTER TABLE "group_access" DROP CONSTRAINT IF EXISTS "group_access_pkey";--> statement-breakpoint
ALTER TABLE "group_access" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "group_access" ALTER COLUMN "group_id" SET NOT NULL;--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'mikrotik_vessels'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

ALTER TABLE "mikrotik_vessels" DROP CONSTRAINT IF EXISTS "mikrotik_vessels_pkey";--> statement-breakpoint
ALTER TABLE "telephony_dids" DROP CONSTRAINT IF EXISTS "telephony_dids_pkey";--> statement-breakpoint
ALTER TABLE "vessels" DROP CONSTRAINT IF EXISTS "vessels_pkey";--> statement-breakpoint
ALTER TABLE "vessel_groups" DROP CONSTRAINT IF EXISTS "vessel_groups_pkey";--> statement-breakpoint
ALTER TABLE "group_access" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "mikrotik_vessels" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "telephony_dids" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "vessel_groups" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "vessels" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "group_access" ADD CONSTRAINT "group_access_group_id_vessel_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."vessel_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_group_id_vessel_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."vessel_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vessel_groups" DROP COLUMN "group_id";--> statement-breakpoint
ALTER TABLE "mikrotik_vessels" ADD CONSTRAINT "mikrotik_vessels_vessel_name_unique" UNIQUE("vessel_name");--> statement-breakpoint
ALTER TABLE "telephony_dids" ADD CONSTRAINT "telephony_dids_number_unique" UNIQUE("number");--> statement-breakpoint
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_vesselskit_number_unique" UNIQUE("vesselskit_number");