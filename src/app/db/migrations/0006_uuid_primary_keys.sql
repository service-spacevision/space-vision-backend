-- Migration to convert all models to use UUID primary keys for consistency

-- Step 1: Add UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Update vessel_groups table
-- Add new UUID id column
ALTER TABLE "vessel_groups" ADD COLUMN "id" UUID DEFAULT uuid_generate_v4();

-- Update the new id column with unique UUIDs for existing records
UPDATE "vessel_groups" SET "id" = uuid_generate_v4() WHERE "id" IS NULL;

-- Make id NOT NULL
ALTER TABLE "vessel_groups" ALTER COLUMN "id" SET NOT NULL;

-- Step 3: Update group_access table to use UUID
-- Add new UUID columns
ALTER TABLE "group_access" ADD COLUMN "id" UUID DEFAULT uuid_generate_v4();
ALTER TABLE "group_access" ADD COLUMN "new_group_id" UUID;

-- Update new_group_id based on old group_id lookup
UPDATE "group_access" 
SET "new_group_id" = "vessel_groups"."id" 
FROM "vessel_groups" 
WHERE "group_access"."group_id" = "vessel_groups"."group_id";

-- Make new columns NOT NULL
ALTER TABLE "group_access" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "group_access" ALTER COLUMN "new_group_id" SET NOT NULL;

-- Step 4: Update vessels table to use UUID
-- Add new UUID columns
ALTER TABLE "vessels" ADD COLUMN "id" UUID DEFAULT uuid_generate_v4();
ALTER TABLE "vessels" ADD COLUMN "new_group_id" UUID;

-- Update new_group_id based on old group_id lookup
UPDATE "vessels" 
SET "new_group_id" = "vessel_groups"."id" 
FROM "vessel_groups" 
WHERE "vessels"."group_id" = "vessel_groups"."group_id";

-- Make new columns NOT NULL
ALTER TABLE "vessels" ALTER COLUMN "id" SET NOT NULL;

-- Step 5: Update mikrotik_vessels table to use UUID
-- Add new UUID id column
ALTER TABLE "mikrotik_vessels" ADD COLUMN "id" UUID DEFAULT uuid_generate_v4();

-- Update the new id column with unique UUIDs for existing records
UPDATE "mikrotik_vessels" SET "id" = uuid_generate_v4() WHERE "id" IS NULL;

-- Make id NOT NULL
ALTER TABLE "mikrotik_vessels" ALTER COLUMN "id" SET NOT NULL;

-- Step 6: Update telephony_dids table to use UUID
-- Add new UUID id column
ALTER TABLE "telephony_dids" ADD COLUMN "id" UUID DEFAULT uuid_generate_v4();

-- Update the new id column with unique UUIDs for existing records
UPDATE "telephony_dids" SET "id" = uuid_generate_v4() WHERE "id" IS NULL;

-- Make id NOT NULL
ALTER TABLE "telephony_dids" ALTER COLUMN "id" SET NOT NULL;

-- Step 7: Drop old constraints and add new ones
-- Drop old foreign key constraints
ALTER TABLE "group_access" DROP CONSTRAINT IF EXISTS "group_access_group_id_vessel_groups_group_id_fk";
ALTER TABLE "vessels" DROP CONSTRAINT IF EXISTS "vessels_group_id_vessel_groups_group_id_fk";

-- Drop old primary key constraints
ALTER TABLE "vessel_groups" DROP CONSTRAINT "vessel_groups_pkey";
ALTER TABLE "group_access" DROP CONSTRAINT "group_access_role_group_id_pk";
ALTER TABLE "vessels" DROP CONSTRAINT "vessels_pkey";
ALTER TABLE "mikrotik_vessels" DROP CONSTRAINT "mikrotik_vessels_pkey";
ALTER TABLE "telephony_dids" DROP CONSTRAINT "telephony_dids_pkey";

-- Step 8: Drop old columns and rename new ones
-- vessel_groups
ALTER TABLE "vessel_groups" DROP COLUMN "group_id";

-- group_access
ALTER TABLE "group_access" DROP COLUMN "group_id";
ALTER TABLE "group_access" RENAME COLUMN "new_group_id" TO "group_id";

-- vessels
ALTER TABLE "vessels" DROP COLUMN "group_id";
ALTER TABLE "vessels" RENAME COLUMN "new_group_id" TO "group_id";

-- Step 9: Add new primary key constraints
ALTER TABLE "vessel_groups" ADD CONSTRAINT "vessel_groups_pkey" PRIMARY KEY ("id");
ALTER TABLE "group_access" ADD CONSTRAINT "group_access_pkey" PRIMARY KEY ("id");
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_pkey" PRIMARY KEY ("id");
ALTER TABLE "mikrotik_vessels" ADD CONSTRAINT "mikrotik_vessels_pkey" PRIMARY KEY ("id");
ALTER TABLE "telephony_dids" ADD CONSTRAINT "telephony_dids_pkey" PRIMARY KEY ("id");

-- Step 10: Add unique constraints on business keys
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_vesselskit_number_unique" UNIQUE ("vesselskit_number");
ALTER TABLE "mikrotik_vessels" ADD CONSTRAINT "mikrotik_vessels_vessel_name_unique" UNIQUE ("vessel_name");
ALTER TABLE "telephony_dids" ADD CONSTRAINT "telephony_dids_number_unique" UNIQUE ("number");

-- Step 11: Add new foreign key constraints
ALTER TABLE "group_access" ADD CONSTRAINT "group_access_group_id_vessel_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "vessel_groups"("id");
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_group_id_vessel_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "vessel_groups"("id");