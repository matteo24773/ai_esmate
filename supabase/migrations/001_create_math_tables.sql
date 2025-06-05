-- Create table for math problem sessions
CREATE TABLE IF NOT EXISTS math_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  problem_data JSONB NOT NULL,
  current_step INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for individual step attempts
CREATE TABLE IF NOT EXISTS step_attempts (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID REFERENCES math_sessions(session_id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  user_input TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  feedback TEXT,
  validation_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_math_sessions_session_id ON math_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_math_sessions_user_id ON math_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_step_attempts_session_id ON step_attempts(session_id);

-- Enable Row Level Security
ALTER TABLE math_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for math_sessions
CREATE POLICY "Users can view their own sessions" ON math_sessions
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create sessions" ON math_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own sessions" ON math_sessions
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Create policies for step_attempts
CREATE POLICY "Users can view step attempts for their sessions" ON step_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM math_sessions 
      WHERE math_sessions.session_id = step_attempts.session_id 
      AND (math_sessions.user_id = auth.uid() OR math_sessions.user_id IS NULL)
    )
  );

CREATE POLICY "Users can create step attempts for their sessions" ON step_attempts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM math_sessions 
      WHERE math_sessions.session_id = step_attempts.session_id 
      AND (math_sessions.user_id = auth.uid() OR math_sessions.user_id IS NULL)
    )
  );
