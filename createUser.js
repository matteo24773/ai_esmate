// Script semplice per inserire un utente in Supabase

const fetch = require('node-fetch');
const md5 = require('md5');

const supabaseUrl = 'https://eeqakxjohdqpfihgkfrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcWFreGpvaGRxcGZpaGdrZnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTA3NTUsImV4cCI6MjA2NDY4Njc1NX0.hEu3a1-nJDLBU5CVPeKV_f0cAccsGyGDWVdI2_L13IU';

// Crea un utente con Supabase Auth
async function createUserWithAuth() {
  try {
    console.log("Creazione utente con Supabase Auth...");
    const nickname = 'prova_nick'; // Cambia qui per testare altri nickname
    
    // Crea utente con Supabase Auth API
    const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        email: 'prova@prova.com',
        password: 'prova'
      })
    });
    
    const data = await response.json();
    console.log("Risultato creazione utente Supabase Auth:", data);
    
    if (data.error) {
      console.error("Errore creazione utente:", data.error.message);
    } else if (data.user) {
      console.log("Utente creato con successo:", data.user.email);
      
      // Inserisci nickname nella tabella 'users' (custom, non auth.users)
      const userRes = await fetch(`${supabaseUrl}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          nickname: nickname
        })
      });
      const userData = await userRes.json();
      console.log("Risultato inserimento user:", userData);
    }
    
    return data;
  } catch (error) {
    console.error("Errore imprevisto:", error);
  }
}

// Esegui la creazione
createUserWithAuth();
