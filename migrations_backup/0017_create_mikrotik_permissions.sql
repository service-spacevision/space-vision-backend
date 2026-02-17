-- Create mikrotik_permissions table
CREATE TABLE IF NOT EXISTS "mikrotik_permissions" (
  "id" SERIAL PRIMARY KEY,
  "mikrotik_vessel_id" INTEGER NOT NULL REFERENCES "mikrotik_vessels" ("id") ON DELETE CASCADE,
  "mikrotik_vessel_name" TEXT NOT NULL,
  "mikrotik_user_name" TEXT NOT NULL,
  "router_ip" TEXT NOT NULL,
  "router_port" INTEGER NOT NULL,
  "organization_id" INTEGER NOT NULL REFERENCES "organizations" ("id") ON DELETE CASCADE,
  "username" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "assigned_by" INTEGER NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_mikrotik_permissions_vessel_id" ON "mikrotik_permissions" ("mikrotik_vessel_id");
CREATE INDEX IF NOT EXISTS "idx_mikrotik_permissions_organization_id" ON "mikrotik_permissions" ("organization_id");
CREATE INDEX IF NOT EXISTS "idx_mikrotik_permissions_assigned_by" ON "mikrotik_permissions" ("assigned_by");

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mikrotik_permissions_updated_at
BEFORE UPDATE ON "mikrotik_permissions"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
