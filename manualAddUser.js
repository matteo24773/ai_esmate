// manualAddUser.js
// This is a script to manually add a test user to Supabase
// Run this script using Node.js in a terminal

const fetch = require('node-fetch');
const md5 = require('md5');

const supabaseUrl = 'https://eeqakxjohdqpfihgkfrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcWFreGpvaGRxcGZpaGdrZnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTA3NTUsImV4cCI6MjA2NDY4Njc1NX0.hEu3a1-nJDLBU5CVPeKV_f0cAccsGyGDWVdI2_L13IU'; // Your anon key from .env

// Funzione per creare la tabella users (se non esiste)
async function createUsersTable() {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({
      query: `CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text UNIQUE NOT NULL,
        password text NOT NULL,
        created_at timestamp with time zone DEFAULT timezone('utc', now())
      );`
    })
  });
  const data = await response.json();
  if (data.error) {
    console.error('Errore creazione tabella:', data.error.message);
  } else {
    console.log('Tabella users pronta.');
  }
}

// Funzione per registrare un utente (password MD5)
async function registerUser(email, password) {
  const passwordHash = md5(password);
  const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({ email, password: passwordHash })
  });
  const data = await response.json();
  if (data && data.length > 0) {
    console.log('Utente registrato:', data[0].email);
  } else {
    console.error('Errore registrazione:', data);
  }
}

// PROBLEMA LOGIN: Modifica per debug
// Funzione per login (verifica email e password MD5)
async function loginUser(email, password) {
  const passwordHash = md5(password);
  console.log("Test login per:", email);
  console.log("Password hash:", passwordHash);
  
  // Verifica diretta con select per email
  const responseTest = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  const dataTest = await responseTest.json();
  console.log("Test solo per email:", dataTest);
  
  // Query normale con email+password
  const response = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}&password=eq.${passwordHash}`, {
    method: 'GET',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  const data = await response.json();
  console.log("Risultato query completa:", data);
  
  if (data && data.length > 0) {
    console.log('Login riuscito per:', data[0].email);
    return true;
  } else {
    console.log('Login fallito: credenziali errate');
    return false;
  }
}

// Esempio di utilizzo:
(async () => {
  await createUsersTable(); // Eseguire solo la prima volta
  await registerUser('prova@prova.com', 'prova');
  await loginUser('prova@prova.com', 'prova');
})();
