// testDB.js - Script per testare la connessione al database e la tabella users
const fetch = require('node-fetch');

// Configurazione Supabase
const supabaseUrl = 'https://eeqakxjohdqpfihgkfrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcWFreGpvaGRxcGZpaGdrZnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTA3NTUsImV4cCI6MjA2NDY4Njc1NX0.hEu3a1-nJDLBU5CVPeKV_f0cAccsGyGDWVdI2_L13IU';

// Funzione per creare un utente direttamente nella tabella auth.users di Supabase
async function createAuthUser() {
  console.log("Test 1: Creazione utente direttamente con auth API");
  
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'password123',
        email_confirm: true
      })
    });
    
    const data = await response.json();
    console.log("Risposta creazione utente:", data);
  } catch (error) {
    console.error("Errore:", error);
  }
}

// Funzione per verificare se la tabella users esiste
async function checkTableExists() {
  console.log("\nTest 2: Verifica se la tabella users esiste");
  
  try {
    // Verifica la lista delle tabelle
    const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`);
    const data = await response.json();
    console.log("Elenco tabelle:", data);
    
    // Verifica specifica tabella users
    const usersResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=*&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log("La tabella users esiste, primi dati:", usersData);
    } else {
      console.log("Errore accesso tabella users:", await usersResponse.text());
    }
  } catch (error) {
    console.error("Errore:", error);
  }
}

// Funzione per creare una tabella e inserire un utente di test
async function createTableAndUser() {
  console.log("\nTest 3: Creazione tabella SQL e inserimento utente di test");
  
  try {
    // SQL per creare tabella
    const sqlQuery = `
    CREATE TABLE IF NOT EXISTS public.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Abilita accesso pubblico per test
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Consenti accesso pubblico a users" ON public.users FOR SELECT USING (true);
    `;
    
    // Esegui SQL via API
    const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: sqlQuery
      })
    });
    
    console.log("Risposta creazione tabella:", sqlResponse.status, await sqlResponse.text());
    
    // Inserisci utente di test (hardcoded md5 di 'prova')
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        email: 'prova@prova.com',
        password: 'c4ca4238a0b923820dcc509a6f75849b' // md5 hash di 'prova'
      })
    });
    
    console.log("Risposta inserimento utente:", insertResponse.status);
    console.log(await insertResponse.text());
  } catch (error) {
    console.error("Errore:", error);
  }
}

// Esegui tutti i test in sequenza
async function runTests() {
  console.log("=== INIZIO DIAGNOSTICA DATABASE ===");
  await createAuthUser();
  await checkTableExists();
  await createTableAndUser();
  console.log("=== FINE DIAGNOSTICA DATABASE ===");
}

runTests();
