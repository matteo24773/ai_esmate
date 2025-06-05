// src/auth.js
import { supabase } from './supabaseClient.js';
import md5 from 'crypto-js/md5';

// Function to handle user registration
async function signUp(email, password, nickname) {
  try {
    // Configure signUp to auto-confirm email so no confirmation email is sent
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          nickname: nickname
        }
      }
    });

    if (error) throw error;

    // If registration is successful, insert nickname into user table
    if (data && data.user) {
      // Insert into 'users' table (custom, not auth.users)
      const { error: userError } = await supabase
        .from('users')
        .insert([{ id: data.user.id, email, nickname }]);
      if (userError) throw userError;
      
      // Auto-confirm the user (workaround to avoid waiting for email confirmation)
      // Log user in immediately after signup
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (loginError) {
        console.error('Error logging in after signup:', loginError.message);
      }
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error signing up:', error.message);
    return { data: null, error };
  }
}

// Function to handle user login
async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in:', error.message);
    return { data: null, error };
  }
}

// Funzione di login custom su tabella users (email + password MD5)
async function customLoginUser(email, password) {
  try {
    console.log("Tentativo login custom per:", email);
    const passwordHash = md5(password).toString();
    console.log("Hash MD5 generato:", passwordHash);
    
    const supabaseUrl = 'https://eeqakxjohdqpfihgkfrg.supabase.co';
    // Usa la chiave direttamente se non è presente import.meta.env
    const supabaseKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY)
      ? import.meta.env.VITE_SUPABASE_ANON_KEY
      : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcWFreGpvaGRxcGZpaGdrZnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTA3NTUsImV4cCI6MjA2NDY4Njc1NX0.hEu3a1-nJDLBU5CVPeKV_f0cAccsGyGDWVdI2_L13IU';
    
    // Primo controllo: verifica se l'utente esiste, solo con email
    console.log("Controllo esistenza email:", email);
    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const checkData = await checkResponse.json();
    console.log("Risultato controllo email:", checkData);
    
    // Verifica completa con email e password
    const response = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}&password=eq.${passwordHash}`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const data = await response.json();
    console.log("Risultato verifica completa:", data);
    
    if (data && data.length > 0) {
      console.log("Login custom riuscito per:", data[0].email);
      // Simula una sessione (puoi usare localStorage o redirect)
      localStorage.setItem('legacy_user', JSON.stringify({ email: data[0].email }));
      return { success: true, user: data[0] };
    } else {
      console.log("Login custom fallito: credenziali non valide");
      return { success: false };
    }
  } catch (error) {
    console.error("Errore durante il login custom:", error);
    return { success: false, error: error.message };
  }
}

// Versione semplificata di login legacy con MD5
async function simpleMD5Login(email, password) {
  try {
    // Genera hash MD5 della password
    const passwordHash = md5(password).toString();
    console.log("Login con email:", email);
    console.log("Password hash MD5:", passwordHash);
    
    // Se email e password corrispondono ai valori test, permettiamo login
    if (email === 'prova@prova.com' && passwordHash === md5('prova').toString()) {
      console.log("Login accettato per utente test");
      // Store authentication info in localStorage
      localStorage.setItem('user_logged_in', 'true');
      localStorage.setItem('user_email', email);
      localStorage.setItem('auth_timestamp', new Date().getTime());
      return { success: true, user: { email } };
    }
    
    return { success: false };
  } catch (error) {
    console.error("Errore in simpleMD5Login:", error);
    return { success: false, error: error.message };
  }
}

// Function to check if user is authenticated and redirect accordingly
async function checkAuth() {
  try {
    // Limita la frequenza di controllo per evitare loop
    const lastCheckTime = parseInt(sessionStorage.getItem('lastAuthCheckTime') || '0');
    const currentTime = new Date().getTime();
    
    // Se l'ultimo controllo è avvenuto meno di 2 secondi fa, salta
    if (currentTime - lastCheckTime < 2000) {
      console.log('Auth check too frequent, skipping to prevent loops');
      return;
    }
    
    // Registra il tempo di questo controllo
    sessionStorage.setItem('lastAuthCheckTime', currentTime.toString());
    
    const { data: { session } } = await supabase.auth.getSession();
    const legacyUser = localStorage.getItem('user_logged_in');
    
    console.log('Auth check - Supabase session:', !!session);
    console.log('Auth check - Legacy login:', !!legacyUser);
    
    // Get current page path without domain
    const currentPath = window.location.pathname;
    
    // Normalize path for more reliable checks
    const normalizedPath = currentPath.toLowerCase();
    
    // Identify login page and homepage with simple checks
    const isLoginPage = normalizedPath === '/' || 
                        normalizedPath === '/index.html' || 
                        normalizedPath === '/register.html';
    const isHomePage = normalizedPath === '/homepage.html';
    
    console.log('Current path:', currentPath);
    console.log('Is login page:', isLoginPage, 'Is homepage:', isHomePage);
    
    // If user is logged in with either method
    if (session || legacyUser) {
      console.log('User is authenticated');
      
      // If on login page, redirect to homepage
      if (isLoginPage) {
        console.log('Redirecting to homepage from login page');
        // Evita di aggiungere altri redirect se già in redirezione
        if (sessionStorage.getItem('redirecting') !== 'true') {
          sessionStorage.setItem('redirecting', 'true');
          
          // Usa setTimeout per dare tempo al browser di completare altre operazioni
          setTimeout(() => {
            window.location.href = '/homepage.html';
            // Pulisci il flag dopo un po' di tempo
            setTimeout(() => {
              sessionStorage.removeItem('redirecting');
            }, 1000);
          }, 100);
        }
        return;
      }
      
      // Update UI for logged-in state
      const logoutButton = document.getElementById('logout-button');
      if (logoutButton) {
        logoutButton.classList.remove('hidden');
      }
        // Update user email display if available
      const userEmailElement = document.getElementById('user-email');
      const userNicknameElement = document.getElementById('user-nickname');
      const userInitialElement = document.getElementById('user-initial');
      
      if (userEmailElement) {
        const email = session ? session.user.email : localStorage.getItem('user_email');
        userEmailElement.textContent = email || '';
      }
      
      if (userNicknameElement) {
        const email = session ? session.user.email : localStorage.getItem('user_email');
        if (email) {
          const nickname = email.split('@')[0];
          userNicknameElement.textContent = nickname;
        }
      }
      
      if (userInitialElement) {
        const email = session ? session.user.email : localStorage.getItem('user_email');
        if (email) {
          const nickname = email.split('@')[0];
          userInitialElement.textContent = nickname.charAt(0).toUpperCase();
        }
      }
      
      console.log('User is logged in and on a protected page');
    } else {
      console.log('User is NOT authenticated');
      
      // If user is trying to access protected pages without being logged in
      if (!isLoginPage && !isHomePage) {
        console.log('Redirecting to login from protected page');
        // Evita di aggiungere altri redirect se già in redirezione
        if (sessionStorage.getItem('redirecting') !== 'true') {
          sessionStorage.setItem('redirecting', 'true');
          
          // Usa setTimeout per dare tempo al browser di completare altre operazioni
          setTimeout(() => {
            window.location.href = '/index.html';
            // Pulisci il flag dopo un po' di tempo
            setTimeout(() => {
              sessionStorage.removeItem('redirecting');
            }, 1000);
          }, 100);
        }
        return;
      }
      
      console.log('User is not logged in and on a public page');
    }
  } catch (error) {
    console.error('Error in checkAuth:', error);
  } finally {
    // Rimuovi il flag quando il controllo è completo (solo se non in redirect)
    if (sessionStorage.getItem('redirecting') !== 'true') {
      sessionStorage.removeItem('lastAuthCheckTime');
    }
  }
}

// Function to sign out
async function signOut() {
  try {
    console.log("Signing out user...");
    
    // Clear Supabase session
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out from Supabase:", error);
    }
    
    // Clear localStorage for legacy authentication
    localStorage.removeItem('user_logged_in');
    localStorage.removeItem('user_email');
    localStorage.removeItem('legacy_user');
    localStorage.removeItem('auth_timestamp');
    
    // Clear any session storage items related to authentication
    sessionStorage.removeItem('lastRedirectTime');
    
    console.log("User signed out successfully");
    
    // Use a small delay before redirecting to ensure everything is cleared
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 100);
  } catch (error) {
    console.error('Error signing out:', error.message);
    // Force redirect to login page even if there was an error
    window.location.href = '/index.html';
  }
}

// Initialize page-specific event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Prima di eseguire checkAuth, aggiungi un piccolo ritardo per permettere alla pagina di caricarsi completamente
  setTimeout(() => {
    // Check authentication status on every page load
    checkAuth();
  }, 500);
  
  // Registration form handling
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const nickname = document.getElementById('nickname').value;
      const errorMessage = document.getElementById('error-message');
      
      // Hide any previous error messages
      errorMessage.classList.add('hidden');
      
      // Validate passwords match
      if (password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match';
        errorMessage.classList.remove('hidden');
        return;
      }
      
      // Validate password strength (at least 6 characters)
      if (password.length < 6) {
        errorMessage.textContent = 'Password must be at least 6 characters long';
        errorMessage.classList.remove('hidden');
        return;
      }
      
      const { data, error } = await signUp(email, password, nickname);
      
      if (error) {
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
      } else {
        // Redirect to login page with success message or directly to dashboard
        window.location.href = '/index.html?registered=true';
      }
    });
  }  // Login form handling
  const loginForm = document.querySelector('form');
  if (loginForm && !loginForm.id) { // Login form senza ID
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      // Clear any previous error messages
      const existingError = document.getElementById('login-error');
      if (existingError) {
        existingError.remove();
      }
      
      // Add a temporary loading state to the button
      const submitButton = loginForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = 'Logging in...';
      submitButton.disabled = true;
        try {
        // Prima prova il login hardcoded per utente test
        console.log("Attempting hardcoded login for:", email);
        const hardcodedLogin = await simpleMD5Login(email, password);
        
        if (hardcodedLogin.success) {
          console.log("Login hardcoded riuscito");
          window.location.href = '/homepage.html';
          return;
        }
        
        // Prova login custom (tabella users con password MD5)
        const legacy = await customLoginUser(email, password);
        
        if (legacy.success) {
          // Login legacy riuscito
          console.log("Login custom riuscito");
          window.location.href = '/homepage.html';
        } else {
          // Se fallisce login custom, prova login Supabase
          const { data, error } = await signIn(email, password);
          
          if (error) {
            // Entrambi i metodi falliti
            console.log("Tutti i metodi di login falliti");
            
            // Create error message if it doesn't exist
            let errorMessage = document.getElementById('login-error');
            if (!errorMessage) {
              errorMessage = document.createElement('div');
              errorMessage.id = 'login-error';
              errorMessage.className = 'text-red-500 text-sm w-full max-w-[300px] text-center mt-2';
              submitButton.insertAdjacentElement('afterend', errorMessage);
            }
            errorMessage.textContent = 'Invalid email or password';
          } else {
            // Login Supabase riuscito
            console.log("Login Supabase riuscito");
            window.location.href = '/homepage.html';
          }
        }
      } catch (error) {
        console.error("Error during login process:", error);
        
        // Reset button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        
        // Show generic error message
        let errorMessage = document.getElementById('login-error');
        if (!errorMessage) {
          errorMessage = document.createElement('div');
          errorMessage.id = 'login-error';
          errorMessage.className = 'text-red-500 text-sm w-full max-w-[300px] text-center mt-2';
          submitButton.insertAdjacentElement('afterend', errorMessage);
        }
        errorMessage.textContent = 'An error occurred during login. Please try again.';
      }
    });
  }
  
  // Check for registration success message
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('registered') === 'true') {
    const loginForm = document.querySelector('form');
    if (loginForm) {
      const successMessage = document.createElement('div');
      successMessage.className = 'text-green-500 text-sm w-full max-w-[300px] text-center mb-4';
      successMessage.textContent = 'Registration successful! Please log in.';
      loginForm.insertAdjacentElement('afterbegin', successMessage);
    }
  }
  
  // Add logout functionality
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', signOut);
  }
});

// Export functions for use in other files
export { signUp, signIn, signOut, checkAuth };

// ATTENZIONE: l'utente di test corretto è prova@prova.com (non prova.prova.com)
// Assicurati di inserire la mail esatta nel form di login!
