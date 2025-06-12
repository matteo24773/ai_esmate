// stopRedirectLoop.js
// Include this script at the top of your HTML pages to help debug and fix redirect loops

(function() {
  // If page just loaded and we're in the middle of a redirect, clear the redirecting flag
  window.addEventListener('load', function() {
    console.log("==== ANTI-LOOP PROTECTION ACTIVE ====");
    
    // Clear any existing redirect flags to break potential loops
    sessionStorage.removeItem('redirecting');
    
    // Check for recent redirects
    const lastRedirectTime = parseInt(sessionStorage.getItem('lastRedirectTime') || '0');
    const currentTime = new Date().getTime();
    const timeSinceLastRedirect = currentTime - lastRedirectTime;
    
    console.log(`Time since last redirect: ${Math.floor(timeSinceLastRedirect/1000)} seconds`);
    
    // If we're caught in a fast redirect loop (< 2 sec between redirects)
    // and we've redirected recently, force a stop to the loop
    if (timeSinceLastRedirect < 2000 && timeSinceLastRedirect > 0) {
      console.log("POTENTIAL REDIRECT LOOP DETECTED - APPLYING EMERGENCY STOP");
      
      // Set a temporary block on redirects
      sessionStorage.setItem('blockRedirects', 'true');
      sessionStorage.setItem('blockExpires', (currentTime + 10000).toString()); // Block for 10 seconds
      
      // Override the window.location.href setter to prevent redirects during block
      const originalLocationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
      
      if (originalLocationDescriptor && originalLocationDescriptor.configurable) {
        Object.defineProperty(window, 'location', {
          configurable: true,
          get: function() {
            return originalLocationDescriptor.get.call(this);
          },
          set: function(url) {
            const blockRedirects = sessionStorage.getItem('blockRedirects') === 'true';
            const blockExpires = parseInt(sessionStorage.getItem('blockExpires') || '0');
            
            if (blockRedirects && new Date().getTime() < blockExpires) {
              console.warn(`REDIRECT BLOCKED to: ${url}`);
              console.log("Redirects temporarily disabled to break loop - will expire in a few seconds");
            } else {
              sessionStorage.removeItem('blockRedirects');
              originalLocationDescriptor.set.call(this, url);
            }
          }
        });
        
        // Restore original behavior after 10 seconds
        setTimeout(function() {
          Object.defineProperty(window, 'location', originalLocationDescriptor);
          sessionStorage.removeItem('blockRedirects');
          sessionStorage.removeItem('blockExpires');
          console.log("Redirect protection removed - normal navigation restored");
        }, 10000);
      }
    }
  });
  
  // Expose helper functions to the global scope
  window.fixAuth = function() {
    console.log("Fixing authentication state...");
    
    // Clear all auth-related storage
    localStorage.removeItem('user_logged_in');
    localStorage.removeItem('user_email');
    localStorage.removeItem('legacy_user');
    localStorage.removeItem('auth_timestamp');
    
    // Clear session storage redirect flags
    sessionStorage.removeItem('lastRedirectTime');
    sessionStorage.removeItem('redirecting');
    sessionStorage.removeItem('blockRedirects');
    sessionStorage.removeItem('blockExpires');
    
    // Clear Supabase session if possible
    const supabaseKey = 'sb-eeqakxjohdqpfihgkfrg-auth-token';
    localStorage.removeItem(supabaseKey);
    
    console.log("Authentication state reset. Refresh the page to apply changes.");
  };
  
  window.setTestUser = function() {
    localStorage.setItem('user_logged_in', 'true');
    localStorage.setItem('user_email', 'prova@prova.com');
    localStorage.setItem('auth_timestamp', new Date().getTime());
    console.log("Test user (prova@prova.com) set. Refresh the page to apply changes.");
  };
  
  window.checkAuthState = function() {
    console.log("Current auth state:");
    console.log("- Supabase session:", !!localStorage.getItem('sb-eeqakxjohdqpfihgkfrg-auth-token'));
    console.log("- Legacy login:", !!localStorage.getItem('user_logged_in'));
    console.log("- Email:", localStorage.getItem('user_email') || 'none');
    console.log("- Auth timestamp:", localStorage.getItem('auth_timestamp') || 'none');
    console.log("- Last redirect:", sessionStorage.getItem('lastRedirectTime') || 'none');
    console.log("- Redirecting flag:", sessionStorage.getItem('redirecting') || 'none');
    
    return {
      supabaseAuth: !!localStorage.getItem('sb-eeqakxjohdqpfihgkfrg-auth-token'),
      legacyAuth: !!localStorage.getItem('user_logged_in'),
      email: localStorage.getItem('user_email'),
      timestamp: localStorage.getItem('auth_timestamp'),
      redirectTime: sessionStorage.getItem('lastRedirectTime'),
      redirecting: sessionStorage.getItem('redirecting')
    };
  };
  
  // Print instructions
  console.log("==== AUTH DEBUGGING HELPERS AVAILABLE ====");
  console.log("- Check auth state: checkAuthState()");
  console.log("- Reset auth state: fixAuth()");
  console.log("- Set test user: setTestUser()");
})();
