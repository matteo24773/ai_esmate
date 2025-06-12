// debugAuth.js
// Add this script to your page to debug authentication issues

// Function to check authentication status with detailed logging
function debugAuthStatus() {
  console.log('==== DEBUG AUTH STATUS ====');

  // 1. Check Supabase session
  const supabaseSessionKey = 'sb-eeqakxjohdqpfihgkfrg-auth-token';
  const supabaseSession = localStorage.getItem(supabaseSessionKey);
  console.log('Supabase session exists:', !!supabaseSession);
  
  // 2. Check legacy auth
  const legacyLoggedIn = localStorage.getItem('user_logged_in');
  const userEmail = localStorage.getItem('user_email');
  console.log('Legacy login active:', !!legacyLoggedIn);
  console.log('User email:', userEmail || 'Not found');
  
  // 3. Check redirect history
  const lastRedirectTime = sessionStorage.getItem('lastRedirectTime');
  console.log('Last redirect time:', lastRedirectTime ? new Date(parseInt(lastRedirectTime)) : 'Never');
  
  // 4. Current page
  const currentPath = window.location.pathname;
  console.log('Current path:', currentPath);
  
  // 5. Return authentication status
  return {
    isAuthenticated: !!supabaseSession || !!legacyLoggedIn,
    email: userEmail,
    currentPath,
    lastRedirect: lastRedirectTime ? new Date(parseInt(lastRedirectTime)) : null
  };
}

// Function to reset authentication
function resetAuth() {
  console.log('==== RESETTING AUTH ====');
  
  // Clear Supabase session
  localStorage.removeItem('sb-eeqakxjohdqpfihgkfrg-auth-token');
  
  // Clear legacy auth
  localStorage.removeItem('user_logged_in');
  localStorage.removeItem('user_email');
  localStorage.removeItem('legacy_user');
  localStorage.removeItem('auth_timestamp');
  
  // Clear session storage
  sessionStorage.removeItem('lastRedirectTime');
  sessionStorage.removeItem('redirecting');
  
  console.log('Auth reset complete. Please refresh the page.');
}

// Function to test login for 'prova@prova.com'
async function testProvaLogin() {
  console.log('==== TESTING PROVA LOGIN ====');
  
  try {
    // Import necessary modules
    const md5 = (await import('crypto-js/md5')).default;
    
    const email = 'prova@prova.com';
    const password = 'prova';
    const passwordHash = md5(password).toString();
    
    console.log('Test login details:');
    console.log('- Email:', email);
    console.log('- Password:', password);
    console.log('- MD5 Hash:', passwordHash);
    
    // Set authentication
    localStorage.setItem('user_logged_in', 'true');
    localStorage.setItem('user_email', email);
    localStorage.setItem('auth_timestamp', new Date().getTime());
    
    console.log('Test login completed - you should now be logged in as the test user.');
    console.log('Please refresh the page to apply changes.');
  } catch (error) {
    console.error('Error testing login:', error);
  }
}

// Instructions for the user
console.log('==== AUTH DEBUGGING TOOLS ====');
console.log('To check authentication status: debugAuthStatus()');
console.log('To reset authentication: resetAuth()');
console.log('To test prova login: testProvaLogin()');

// Run initial check
debugAuthStatus();
