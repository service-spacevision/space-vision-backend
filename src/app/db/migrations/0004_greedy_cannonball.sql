-- Migration to update group schema from groupName to groupId

-- Step 1: Add groupId column to vessel_groups table as SERIAL
ALTER TABLE "vessel_groups" ADD COLUMN "group_id" SERIAL;

-- Step 2: Drop the old primary key constraint on group_name
ALTER TABLE "vessel_groups" DROP CONSTRAINT "vessel_groups_pkey";

-- Step 3: Add new primary key constraint on group_id
ALTER TABLE "vessel_groups" ADD CONSTRAINT "vessel_groups_pkey" PRIMARY KEY ("group_id");

-- Step 4: Add unique constraint on group_name
ALTER TABLE "vessel_groups" ADD CONSTRAINT "vessel_groups_group_name_unique" UNIQUE ("group_name");

-- Step 5: Add groupId column to group_access table (nullable initially)
ALTER TABLE "group_access" ADD COLUMN "group_id" INTEGER;

-- Step 6: Update group_access.group_id based on group_name lookup
UPDATE "group_access" 
SET "group_id" = "vessel_groups"."group_id" 
FROM "vessel_groups" 
WHERE "group_access"."group_name" = "vessel_groups"."group_name";

-- Step 7: Make group_id NOT NULL (required for primary key)
ALTER TABLE "group_access" ALTER COLUMN "group_id" SET NOT NULL;

-- Step 8: Drop old primary key constraint from group_access
ALTER TABLE "group_access" DROP CONSTRAINT "group_access_role_group_name_pk";

-- Step 9: Add new primary key constraint on group_access
ALTER TABLE "group_access" ADD CONSTRAINT "group_access_role_group_id_pk" PRIMARY KEY ("role", "group_id");

-- Step 10: Add foreign key constraint
ALTER TABLE "group_access" ADD CONSTRAINT "group_access_group_id_vessel_groups_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "vessel_groups"("group_id");

-- Step 11: Drop old group_name column from group_access
ALTER TABLE "group_access" DROP COLUMN "group_name";

-- Step 12: Add groupId column to vessels table (nullable initially)
ALTER TABLE "vessels" ADD COLUMN "group_id" INTEGER;

-- Step 13: Update vessels.group_id based on group_name lookup
UPDATE "vessels" 
SET "group_id" = "vessel_groups"."group_id" 
FROM "vessel_groups" 
WHERE "vessels"."group_name" = "vessel_groups"."group_name";

-- Step 14: Add foreign key constraint for vessels
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_group_id_vessel_groups_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "vessel_groups"("group_id");

-- Step 15: Drop old group_name column from vessels
ALTER TABLE "vessels" DROP COLUMN "group_name";