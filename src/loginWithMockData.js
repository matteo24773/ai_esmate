// Soluzione temporanea per bypassare il database e permettere il login

// Funzione per validare il login con dati di test hardcoded
export function validateLogin(email, password) {
  // Dati utente hardcoded per test
  const testUsers = [
    { email: 'prova@prova.com', password: 'prova' },
    { email: 'test@test.com', password: 'test' }
  ];
  
  // Verifica se le credenziali corrispondono a uno degli utenti di test
  const matchedUser = testUsers.find(user => 
    user.email === email && user.password === password
  );
  
  if (matchedUser) {
    // Simula una sessione utilizzando localStorage
    localStorage.setItem('mockUser', JSON.stringify({
      email: matchedUser.email,
      isLoggedIn: true,
      loginTime: new Date().toISOString()
    }));
    return { success: true, user: { email: matchedUser.email } };
  }
  
  return { success: false };
}

// Funzione per verificare se l'utente è loggato
export function checkLoginStatus() {
  const userJson = localStorage.getItem('mockUser');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      return user.isLoggedIn === true;
    } catch (e) {
      console.error('Errore parsing JSON utente:', e);
    }
  }
  return false;
}

// Funzione per effettuare il logout
export function logoutUser() {
  localStorage.removeItem('mockUser');
  return { success: true };
}
