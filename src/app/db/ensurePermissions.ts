import { sql } from 'drizzle-orm'
import { db } from './connection'

export async function ensurePermissions() {
  // Ensure enums exist
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'permission_scope' AND n.nspname = 'public'
      ) THEN
        CREATE TYPE permission_scope AS ENUM ('own', 'organization', 'all');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'permission_category' AND n.nspname = 'public'
      ) THEN
        CREATE TYPE permission_category AS ENUM ('navigation', 'component', 'api');
      END IF;
    END $$;
  `)

  // Ensure permissions table exists
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS permissions (
      id SERIAL PRIMARY KEY,
      name varchar(255) NOT NULL,
      resource varchar(255) NOT NULL,
      action varchar(100) NOT NULL,
      scope permission_scope DEFAULT 'own',
      category permission_category NOT NULL,
      description text,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    )
  `)

  // Ensure uniqueness on name (works even if table created without constraint)
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'permissions_name_unique'
      ) THEN
        ALTER TABLE permissions
        ADD CONSTRAINT permissions_name_unique UNIQUE (name);
      END IF;
    END $$;
  `)
}

