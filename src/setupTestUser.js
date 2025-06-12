// src/setupTestUser.js
import { supabase } from './supabaseClient.js';

async function setupTestUser() {
  const email = 'prova@gmail.co';
  const password = 'prova';

  try {
    // Check if the user already exists
    const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (existingUser && existingUser.user) {
      console.log('Test user already exists');
      return;
    }

    // Create the test user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Error creating test user:', error.message);
    } else {
      console.log('Test user created successfully:', data.user.email);
    }
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

setupTestUser();
