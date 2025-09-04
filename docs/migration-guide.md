# Database Migration Best Practices

## Overview
This guide outlines best practices for handling database migrations in our Drizzle + PostgreSQL setup to avoid common issues like primary key conflicts.

## Common Issues and Solutions

### 1. Primary Key Conflicts
**Problem**: Multiple primary keys defined on a table (e.g., `serial` column + composite primary key)

**Solution**: Choose one approach:
- **Option A**: Use `serial("id")` (without `.primaryKey()`) + composite primary key
- **Option B**: Use `serial("id").primaryKey()` and create unique indexes instead of composite primary keys

### 2. Column Already Exists Errors
**Problem**: Migration tries to add columns that already exist

**Solution**: Use conditional SQL with `IF NOT EXISTS` checks

### 3. Constraint Already Exists Errors
**Problem**: Migration tries to add constraints that already exist

**Solution**: Use conditional SQL to check for existing constraints

## Best Practices

### 1. Use Migration Utilities
Import and use the migration utilities from `src/app/db/migrationUtils.ts`:

```typescript
import { migrationHelpers } from '../migrationUtils';

// Example usage in migration files
const addColumnSafely = migrationHelpers.addColumnIfNotExists(
  'users', 
  'new_column', 
  'VARCHAR(255)'
);
```

### 2. Make Migrations Idempotent
All migrations should be safe to run multiple times:

```sql
-- ❌ Bad: Will fail if column exists
ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- ✅ Good: Safe to run multiple times
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email'
    ) THEN
        ALTER TABLE users ADD COLUMN email VARCHAR(255);
    END IF;
END $$;
```

### 3. Handle Primary Key Changes Carefully
When changing primary keys:

```sql
-- Use the helper function
DO $$ 
DECLARE 
    existing_pk_name text;
BEGIN
    -- Find and drop existing primary key
    SELECT tc.constraint_name INTO existing_pk_name
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'your_table'
      AND tc.constraint_type = 'PRIMARY KEY';
    
    IF existing_pk_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE your_table DROP CONSTRAINT ' || existing_pk_name;
    END IF;
    
    -- Add new primary key
    ALTER TABLE your_table ADD CONSTRAINT new_pk_name PRIMARY KEY(col1, col2);
END $$;
```

### 4. Test Migrations Locally
Always test migrations on a copy of production data:

```bash
# Create a backup first
bun run db:backup

# Run migration
bun run db:migrate

# If issues occur, restore from backup
bun run db:restore
```

### 5. Schema Design Guidelines

#### For Tables with Natural Composite Keys
```typescript
export const starlinkUsage = pgTable("starlink_usage", {
  id: serial("id"), // No .primaryKey() or .unique()
  dateKey: text("date_key").notNull(),
  kitNumber: text("kit_number").notNull(),
  // ... other columns
}, (table) => [
  primaryKey({ columns: [table.dateKey, table.kitNumber] }),
]);
```

#### For Tables with Simple Primary Keys
```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  // ... other columns
});
```

## Migration Workflow

1. **Make Schema Changes**: Update your Drizzle schema files
2. **Generate Migration**: Run `bun run db:generate`
3. **Review Migration**: Check the generated SQL for potential issues
4. **Edit if Needed**: Make migrations idempotent using the utilities
5. **Test Locally**: Run migration on local database
6. **Apply to Production**: Run migration on production database

## Troubleshooting

### Migration Fails with "multiple primary keys"
1. Check your schema definition for conflicting primary key declarations
2. Use the `replacePrimaryKey` utility function
3. Ensure only one primary key method is used per table

### Migration Fails with "column already exists"
1. Make the migration idempotent using `addColumnIfNotExists`
2. Check if the migration was partially applied before

### Migration Fails with "constraint already exists"
1. Use `addConstraintIfNotExists` utility
2. Check existing constraints before adding new ones

## Example Migration File

```sql
-- Safe migration example
-- Add new columns safely
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20);
    END IF;
END $$;

-- Add constraint safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'users' AND constraint_name = 'users_email_unique'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE(email);
    END IF;
END $$;
```