-- Add organizations table and org-related columns safely

-- Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS "organizations" (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL UNIQUE,
  "description" text,
  "logo" text,
  "subscription_id" text,
  "parent_org_name" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Optional: add self-reference for parent organization (no IF NOT EXISTS for FK in PG <15)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'organizations_parent_org_name_fkey'
      AND table_name = 'organizations'
  ) THEN
    ALTER TABLE "organizations"
      ADD CONSTRAINT organizations_parent_org_name_fkey
      FOREIGN KEY ("parent_org_name") REFERENCES "organizations"("name")
      ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
END $$;

-- Add organization_name to users if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'organization_name'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "organization_name" varchar(100);
  END IF;
END $$;

-- Add created_by to user_roles if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_roles' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE "user_roles" ADD COLUMN "created_by" varchar(100);
  END IF;
END $$;

-- Add organization_name to user_roles if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_roles' AND column_name = 'organization_name'
  ) THEN
    ALTER TABLE "user_roles" ADD COLUMN "organization_name" varchar(100);
  END IF;
END $$;

