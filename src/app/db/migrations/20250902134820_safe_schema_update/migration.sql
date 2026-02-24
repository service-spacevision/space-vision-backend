-- Safe schema migration to add auto-increment IDs

-- Add ID columns to usage tables if they don't exist
DO $$ 
BEGIN
    -- Add ID to bluetide_usage if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bluetide_usage' AND column_name = 'id') THEN
        ALTER TABLE "bluetide_usage" ADD COLUMN "id" serial PRIMARY KEY;
    END IF;
    
    -- Add ID to starlink_usage if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'starlink_usage' AND column_name = 'id') THEN
        ALTER TABLE "starlink_usage" ADD COLUMN "id" serial PRIMARY KEY;
    END IF;
END $$;

-- Drop composite primary keys if they exist
DO $$
BEGIN
    -- Drop bluetide_usage composite key if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'bluetide_usage_date_kitp_pk') THEN
        ALTER TABLE "bluetide_usage" DROP CONSTRAINT "bluetide_usage_date_kitp_pk";
    END IF;
    
    -- Drop starlink_usage composite key if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'starlink_usage_date_key_kit_number_pk') THEN
        ALTER TABLE "starlink_usage" DROP CONSTRAINT "starlink_usage_date_key_kit_number_pk";
    END IF;
END $$;

-- Convert UUID columns to integers for existing tables
DO $$
BEGIN
    -- Convert users.id from UUID to serial if it's currently UUID
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id' AND data_type = 'uuid') THEN
        -- Create a temporary mapping table
        CREATE TEMP TABLE user_id_mapping AS 
        SELECT id as old_id, row_number() OVER (ORDER BY created_at) as new_id FROM users;
        
        -- Add new integer ID column
        ALTER TABLE users ADD COLUMN new_id serial;
        
        -- Update the new_id with sequential values
        UPDATE users SET new_id = (SELECT new_id FROM user_id_mapping WHERE old_id = users.id);
        
        -- Update foreign key references
        UPDATE sessions SET user_id = (SELECT new_id FROM user_id_mapping WHERE old_id = sessions.user_id::uuid)
        WHERE EXISTS (SELECT 1 FROM user_id_mapping WHERE old_id = sessions.user_id::uuid);
        
        -- Drop old constraints and columns
        ALTER TABLE users DROP CONSTRAINT users_pkey;
        ALTER TABLE users DROP COLUMN id;
        ALTER TABLE users RENAME COLUMN new_id TO id;
        ALTER TABLE users ADD PRIMARY KEY (id);
        
        -- Update sessions user_id column type
        ALTER TABLE sessions ALTER COLUMN user_id TYPE integer USING user_id::integer;
    END IF;
    
    -- Convert user_roles.id from UUID to serial if it's currently UUID
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'id' AND data_type = 'uuid') THEN
        -- Create a temporary mapping table
        CREATE TEMP TABLE role_id_mapping AS 
        SELECT id as old_id, row_number() OVER (ORDER BY created_at) as new_id FROM user_roles;
        
        -- Add new integer ID column
        ALTER TABLE user_roles ADD COLUMN new_id serial;
        
        -- Update the new_id with sequential values
        UPDATE user_roles SET new_id = (SELECT new_id FROM role_id_mapping WHERE old_id = user_roles.id);
        
        -- Update foreign key references in users table
        UPDATE users SET role_id = (SELECT new_id FROM role_id_mapping WHERE old_id = users.role_id::uuid)
        WHERE users.role_id IS NOT NULL AND EXISTS (SELECT 1 FROM role_id_mapping WHERE old_id = users.role_id::uuid);
        
        -- Drop old constraints and columns
        ALTER TABLE user_roles DROP CONSTRAINT user_roles_pkey;
        ALTER TABLE user_roles DROP COLUMN id;
        ALTER TABLE user_roles RENAME COLUMN new_id TO id;
        ALTER TABLE user_roles ADD PRIMARY KEY (id);
        
        -- Update users role_id column type
        ALTER TABLE users ALTER COLUMN role_id TYPE integer USING role_id::integer;
    END IF;
    
    -- Convert sessions.id from UUID to serial if it's currently UUID
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'id' AND data_type = 'uuid') THEN
        ALTER TABLE sessions DROP CONSTRAINT sessions_pkey;
        ALTER TABLE sessions DROP COLUMN id;
        ALTER TABLE sessions ADD COLUMN id serial PRIMARY KEY;
    END IF;
END $$;