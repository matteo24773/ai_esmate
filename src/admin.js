// Admin utility script to manage users

import { supabase } from './supabaseClient.js';

// Create a test user
export async function createTestUser() {
  const email = 'prova@gmail.co';
  const password = 'prova';
  
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm the email
    });
    
    if (error) throw error;
    console.log('Test user created successfully:', data.user);
    return data.user;
  } catch (error) {
    console.error('Error creating test user:', error.message);
    return null;
  }
}
