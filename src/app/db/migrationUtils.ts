/**
 * Migration utilities for safer database schema changes
 */

export const migrationHelpers = {
  /**
   * Safely add a column if it doesn't exist
   */
  addColumnIfNotExists: (tableName: string, columnName: string, columnDefinition: string) => `
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = '${tableName}' AND column_name = '${columnName}'
        ) THEN
            ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition};
        END IF;
    END $$;
  `,

  /**
   * Safely drop a column if it exists
   */
  dropColumnIfExists: (tableName: string, columnName: string) => `
    DO $$ 
    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = '${tableName}' AND column_name = '${columnName}'
        ) THEN
            ALTER TABLE ${tableName} DROP COLUMN ${columnName};
        END IF;
    END $$;
  `,

  /**
   * Safely add a constraint if it doesn't exist
   */
  addConstraintIfNotExists: (tableName: string, constraintName: string, constraintDefinition: string) => `
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_schema = 'public' 
            AND table_name = '${tableName}' 
            AND constraint_name = '${constraintName}'
        ) THEN
            ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} ${constraintDefinition};
        END IF;
    END $$;
  `,

  /**
   * Safely drop a constraint if it exists
   */
  dropConstraintIfExists: (tableName: string, constraintName: string) => `
    DO $$
    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_schema = 'public' 
            AND table_name = '${tableName}' 
            AND constraint_name = '${constraintName}'
        ) THEN
            ALTER TABLE ${tableName} DROP CONSTRAINT ${constraintName};
        END IF;
    END $$;
  `,

  /**
   * Replace primary key constraint safely
   */
  replacePrimaryKey: (tableName: string, newConstraintName: string, columns: string[]) => `
    DO $$ 
    DECLARE 
        existing_pk_name text;
    BEGIN
        -- Find existing primary key constraint
        SELECT tc.constraint_name INTO existing_pk_name
        FROM information_schema.table_constraints tc
        WHERE tc.table_schema = 'public'
          AND tc.table_name = '${tableName}'
          AND tc.constraint_type = 'PRIMARY KEY';
        
        -- Drop existing primary key if it exists
        IF existing_pk_name IS NOT NULL THEN
            EXECUTE 'ALTER TABLE ${tableName} DROP CONSTRAINT ' || existing_pk_name;
        END IF;
        
        -- Add new primary key if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc2
            WHERE tc2.table_schema = 'public' 
            AND tc2.table_name = '${tableName}' 
            AND tc2.constraint_name = '${newConstraintName}'
        ) THEN
            ALTER TABLE ${tableName} ADD CONSTRAINT ${newConstraintName} PRIMARY KEY(${columns.join(', ')});
        END IF;
    END $$;
  `,

  /**
   * Safely create an index if it doesn't exist
   */
  createIndexIfNotExists: (indexName: string, tableName: string, columns: string[], unique = false) => `
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND tablename = '${tableName}' 
            AND indexname = '${indexName}'
        ) THEN
            CREATE ${unique ? 'UNIQUE' : ''} INDEX ${indexName} ON ${tableName}(${columns.join(', ')});
        END IF;
    END $$;
  `,

  /**
   * Safely drop an index if it exists
   */
  dropIndexIfExists: (indexName: string) => `
    DROP INDEX IF EXISTS ${indexName};
  `
};

export default migrationHelpers;