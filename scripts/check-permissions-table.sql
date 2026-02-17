-- Check if the permissions table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'permissions'
) AS table_exists;

-- Check the structure of the permissions table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'permissions';

-- Check if the section column exists
SELECT EXISTS (
   SELECT 1 
   FROM information_schema.columns 
   WHERE table_name='permissions' AND column_name='section'
) AS column_exists;
