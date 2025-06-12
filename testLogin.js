// testLogin.js
import { createClient } from '@supabase/supabase-js';
import md5 from 'crypto-js/md5';

// This script tests the login functionality for the test user
const supabaseUrl = 'https://eeqakxjohdqpfihgkfrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcWFreGpvaGRxcGZpaGdrZnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTA3NTUsImV4cCI6MjA2NDY4Njc1NX0.hEu3a1-nJDLBU5CVPeKV_f0cAccsGyGDWVdI2_L13IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMD5Login() {
  const email = 'prova@prova.com';
  const password = 'prova';
  const passwordHash = md5(password).toString();
  
  console.log('Testing MD5 login with:');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('MD5 Hash:', passwordHash);
  
  // Check if user exists in the database
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', passwordHash);
  
  if (error) {
    console.error('Error checking user:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('✅ User found in database with matching credentials!');
    console.log('User details:', data[0]);
  } else {
    console.log('❌ User not found or credentials do not match');
    
    // Try just checking the email to see if user exists
    const { data: emailCheck } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);
    
    if (emailCheck && emailCheck.length > 0) {
      console.log('User with this email exists, but password hash doesn\'t match');
      console.log('Stored hash:', emailCheck[0].password);
    } else {
      console.log('No user with this email exists in the database');
    }
  }
}

testMD5Login();
