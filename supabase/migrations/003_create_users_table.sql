-- Create users table to store app-specific user info (id, email, nickname)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  nickname TEXT
);

-- Optional: enable RLS and allow users to insert/select their own row
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own user row" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can select their own user row" ON users
  FOR SELECT USING (auth.uid() = id);
