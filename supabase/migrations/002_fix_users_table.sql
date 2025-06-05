-- Migration: Change users.id to UUID and match Supabase Auth schema
ALTER TABLE users
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- If id is not already primary key, ensure it is
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_pkey,
  ADD PRIMARY KEY (id);

-- Optional: ensure email is unique
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users(email);
