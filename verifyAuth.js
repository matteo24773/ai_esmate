// verifyAuth.js
// This script will run in the browser console to verify if the login was successful

function checkAuthStatus() {
  console.log('Checking authentication status...');
  
  // Check Supabase session
  const supabaseSession = localStorage.getItem('sb-eeqakxjohdqpfihgkfrg-auth-token');
  
  // Check legacy auth
  const legacyLoggedIn = localStorage.getItem('user_logged_in');
  const userEmail = localStorage.getItem('user_email');
  
  console.log('Supabase session exists:', !!supabaseSession);
  console.log('Legacy login active:', !!legacyLoggedIn);
  console.log('User email:', userEmail || 'Not found');
  
  if (supabaseSession || legacyLoggedIn) {
    console.log('✅ User is successfully authenticated!');
    return true;
  } else {
    console.log('❌ User is not authenticated');
    return false;
  }
}

// This function can be called from the browser console
checkAuthStatus();
