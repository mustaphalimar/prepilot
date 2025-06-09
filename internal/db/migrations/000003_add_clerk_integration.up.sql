-- Add Clerk integration fields to users table
ALTER TABLE users
DROP COLUMN IF EXISTS password,
ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE NOT NULL,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE;

-- Update the name column to be nullable since we now have first_name and last_name
ALTER TABLE users
ALTER COLUMN name
DROP NOT NULL;

-- Create index on clerk_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users (clerk_id);

-- Create index on email for faster lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Add constraint to ensure either name or first_name is provided
ALTER TABLE users ADD CONSTRAINT check_user_has_name CHECK (
    (
        name IS NOT NULL
        AND name != ''
    )
    OR (
        first_name IS NOT NULL
        AND first_name != ''
    )
);
