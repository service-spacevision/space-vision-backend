-- Fix role_id column type from varchar to uuid
-- First, drop the default value
ALTER TABLE "users" ALTER COLUMN "role_id" DROP DEFAULT;

-- Update existing users to use role IDs instead of role names
UPDATE "users" SET "role_id" = (
  SELECT "id" FROM "user_roles" WHERE "name" = "users"."role_id"
) WHERE "role_id" IN ('admin', 'user', 'moderator');

-- Now change the column type to uuid
ALTER TABLE "users" ALTER COLUMN "role_id" TYPE uuid USING "role_id"::uuid;