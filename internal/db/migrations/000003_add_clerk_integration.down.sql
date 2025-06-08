-- Rollback Clerk integration changes to users table

-- Drop constraints first
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_has_name;

-- Drop indexes
DROP INDEX IF EXISTS idx_users_clerk_id;
DROP INDEX IF EXISTS idx_users_email;

-- Remove Clerk-specific columns
ALTER TABLE users 
DROP COLUMN IF EXISTS clerk_id,
DROP COLUMN IF EXISTS first_name,
DROP COLUMN IF EXISTS last_name,
DROP COLUMN IF EXISTS image_url,
DROP COLUMN IF EXISTS email_verified,
DROP COLUMN IF EXISTS last_sign_in_at,
DROP COLUMN IF EXISTS banned;

-- Restore password column and make name required
ALTER TABLE users 
ADD COLUMN password TEXT NOT NULL DEFAULT 'placeholder',
ALTER COLUMN name SET NOT NULL;

-- Remove the default after adding the column
ALTER TABLE users ALTER COLUMN password DROP DEFAULT;