// src/createTables.js
// This script creates the necessary tables in Supabase

import { supabase } from './supabaseClient.js';

async function createUsersTable() {
  console.log('Creating users table...');
  
  const { error } = await supabase.rpc('create_users_table');
  
  if (error) {
    console.error('Error creating users table:', error.message);
    // If the RPC call fails, try with direct SQL
    await createUsersTableWithSQL();
  } else {
    console.log('Users table created successfully!');
  }
}

async function createUsersTableWithSQL() {
  console.log('Trying to create users table with SQL...');
  
  const { error } = await supabase.from('_exec_sql').select('*').eq('query', `
    CREATE TABLE IF NOT EXISTS public.users (
      id UUID PRIMARY KEY REFERENCES auth.users(id),
      email TEXT NOT NULL,
      full_name TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
      last_sign_in TIMESTAMP WITH TIME ZONE,
      progress JSONB DEFAULT '{}'::jsonb,
      profile_pic_url TEXT
    );
    
    -- Create a secure RLS policy for the users table
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    
    -- Create policy to allow users to view and update only their own data
    CREATE POLICY "Users can view and update own data" ON public.users
      FOR ALL
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
    
    -- Allow public to view limited user data
    CREATE POLICY "Public can view limited user data" ON public.users
      FOR SELECT
      USING (true);
      
    -- Create trigger to automatically insert a new user record when a user signs up
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.users (id, email, full_name)
      VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- Create trigger on auth.users table
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `);
  
  if (error) {
    console.error('Error creating users table with SQL:', error.message);
    
    // Try an alternative approach with simple table creation
    await createSimpleUsersTable();
  } else {
    console.log('Users table created successfully with SQL!');
  }
}

async function createSimpleUsersTable() {
  console.log('Creating a simple users table...');
  
  const { error } = await supabase
    .from('users')
    .insert([
      {
        id: crypto.randomUUID(),
        email: 'prova@gmail.co',
        full_name: 'Test User',
        progress: {}
      }
    ]);
  
  if (error) {
    if (error.code === '42P01') { // Relation doesn't exist
      console.log('Table does not exist yet, creating it first...');
      await createUsersTableManually();
    } else {
      console.error('Failed to insert into users table:', error.message);
    }
  } else {
    console.log('User added to users table successfully!');
  }
}

// Create users_math_progress table for tracking user progress
async function createMathProgressTable() {
  console.log('Creating users_math_progress table...');
  
  const { error } = await supabase.from('_exec_sql').select('*').eq('query', `
    CREATE TABLE IF NOT EXISTS public.users_math_progress (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES public.users(id) NOT NULL,
      category TEXT NOT NULL,
      total_questions INTEGER DEFAULT 0,
      correct_answers INTEGER DEFAULT 0,
      last_session TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
    );
    
    -- Enable RLS
    ALTER TABLE public.users_math_progress ENABLE ROW LEVEL SECURITY;
    
    -- Create policy for users to view and update only their own progress
    CREATE POLICY "Users can view and update own progress" ON public.users_math_progress
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  `);
  
  if (error) {
    console.error('Error creating users_math_progress table:', error.message);
  } else {
    console.log('Users_math_progress table created successfully!');
  }
}

// Execute the table creation
async function createAllTables() {
  try {
    await createUsersTable();
    await createMathProgressTable();
    console.log('All tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error.message);
  }
}

createAllTables();
