// Questo script aiuta a prevenire loop di reindirizzamento
// tra homepage e pagina di login

// Verifica se c'è un loop in corso
if (window.location.pathname.includes('homepage')) {
  localStorage.setItem('was_in_homepage', 'true');
  localStorage.removeItem('was_in_login');
  
  // Se arriviamo alla homepage da un redirect
  if (sessionStorage.getItem('redirecting')) {
    console.log('Reset del flag di redirezione nella homepage');
    sessionStorage.removeItem('redirecting');
  }
} 
else if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
  localStorage.setItem('was_in_login', 'true');
  
  // Se arriviamo alla pagina di login dalla homepage
  if (localStorage.getItem('was_in_homepage') === 'true') {
    console.log('Rilevato possibile loop di reindirizzamento, reset dei flag');
    localStorage.removeItem('was_in_homepage');
    sessionStorage.removeItem('redirecting');
    sessionStorage.removeItem('lastRedirectTime');
    sessionStorage.removeItem('lastAuthCheckTime');
    sessionStorage.removeItem('authCheckInProgress');
  }
}

// Imposta un limite massimo ai redirect
let redirectCount = parseInt(sessionStorage.getItem('redirect_count') || '0');
if (redirectCount > 3) {
  console.log('Troppe redirezioni, reset dei flag');
  sessionStorage.removeItem('redirecting');
  sessionStorage.removeItem('lastRedirectTime');
  sessionStorage.removeItem('lastAuthCheckTime');
  sessionStorage.removeItem('authCheckInProgress');
  sessionStorage.setItem('redirect_count', '0');
} else {
  sessionStorage.setItem('redirect_count', (redirectCount + 1).toString());
}

// Dopo 10 secondi, reset del contatore
setTimeout(() => {
  sessionStorage.setItem('redirect_count', '0');
}, 10000);
