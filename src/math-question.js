// math-question.js
import './style.css';
import { supabase } from './supabaseClient';
import './enhanced-validation.js';

// Add math.js for math expression parsing in the browser (for dev mode validation)
if (typeof window !== 'undefined' && !window.math) {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mathjs@11.8.0/lib/browser/math.js';
  script.async = false;
  document.head.appendChild(script);
}

// Configuration
const CONFIG = {
  // Set to false when backend is deployed and ready
  FORCE_DEVELOPMENT_MODE: false,
  
  // Backend endpoints
  ENDPOINTS: { 
    NEW_PROBLEM: '/functions/v1/new-problem',
    VALIDATE_STEP: '/functions/v1/validate-step'
  }
};

// Global variables for session management
let currentSession = null;
let currentProblem = null;
let selectedTopic = null;
let selectedDifficulty = 'Beginner'; // Default difficulty

// Initialize the math question page
document.addEventListener('DOMContentLoaded', async function() {
  // Check authentication and update UI
  await updateUserInfo();
  
  // Get selected topic from sessionStorage
  selectedTopic = sessionStorage.getItem('selectedTopic') || 'algebra';
  console.log('Selected topic:', selectedTopic);
  
  // Initialize difficulty selector
  initializeDifficultySelector();
    
  // Initialize a new problem session from backend
  await initializeNewProblem(selectedTopic, selectedDifficulty);
  
  // Set up UI event handlers
  setupEventHandlers();
});

// Function to initialize a new problem from backend
async function initializeNewProblem(topic, difficulty = 'Beginner') {
  try {
    // Rimuovi eventuali notifiche di modalità casuale
    hideRandomModeNotice();
    
    // Show loading state
    console.log('🧪 [initializeNewProblem] Inizializzazione nuovo problema - Argomento:', topic, 'Difficoltà:', difficulty);
    showLoadingState();
    
    // Forza sempre la generazione casuale degli esercizi
    console.log('🎲 Generazione esercizi completamente casuali');
    useRandomProblems(topic, difficulty);
    return;
    
    // Il codice seguente non verrà mai eseguito
    // Check if we should force development mode
    if (CONFIG.FORCE_DEVELOPMENT_MODE) {
      console.log('🚧 Forced development mode - using mock data');
      useDevelopmentFallback(topic, difficulty);
      return;
    }
    
    // Try to call the backend API
    const response = await fetch(`${supabase.supabaseUrl}${CONFIG.ENDPOINTS.NEW_PROBLEM}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.supabaseKey}`
      },
      body: JSON.stringify({ 
        topic: topic,
        difficulty: difficulty 
      })
    });

    if (!response.ok) {
      throw new Error(`Backend not available (HTTP ${response.status})`);
    }

    const data = await response.json();
    
    // Store session data globally
    currentSession = {
      sessionId: data.sessionId,
      currentStep: 0,
      totalSteps: data.totalSteps,
      isCompleted: false
    };
      currentProblem = {
      id: data.problemId,
      problem: data.problem,
      equation: data.problem || data.equation,
      description: data.description,
      difficulty: data.difficulty,
      topic: data.topic,
      steps: data.steps || [],
      solution: data.solution
    };
    
    // Update the UI with the new problem
    updateProblemDisplay(currentProblem, topic);
    
    // Clear any previous solution log
    clearSolutionLog();
      } catch (error) {
    console.error('Backend not available, using development fallback:', error);
    
    // Development fallback: use mock data
    useDevelopmentFallback(topic, difficulty);
  }
}

// Development fallback function with mock data
function useDevelopmentFallback(topic, difficulty = 'Beginner') {
  console.log('🚧 Using development fallback - Topic:', topic, 'Difficulty:', difficulty);

  // Genera un problema casuale invece di usare problemi predefiniti
  const randomProblem = generateRandomProblem(topic, difficulty);
  
  // Mock session data
  currentSession = {
    sessionId: 'dev-session-' + Date.now(),
    currentStep: 0,
    totalSteps: randomProblem.steps.length,
    isCompleted: false,
    isDevelopmentMode: true
  };
    
  currentProblem = {
    id: `dev-${topic}-${difficulty}-${Date.now()}`,
    problem: randomProblem.equation || randomProblem.problem,
    equation: randomProblem.equation || randomProblem.problem,
    description: randomProblem.description,
    difficulty: randomProblem.difficulty,
    topic: randomProblem.topic,
    steps: randomProblem.steps || [],
    solution: randomProblem.solution
  };
  
  console.log('📊 Created random problem:', currentProblem);
  
  // Update the UI with the new problem
  updateProblemDisplay(currentProblem, topic);
  
  // Clear any previous solution log
  clearSolutionLog();
  
  // Show development notice
  showDevelopmentNotice();
}

// Funzione per usare problemi completamente casuali
function useRandomProblems(topic, difficulty = 'Beginner') {
  console.log('🎲 Generazione esercizi completamente casuali - Argomento:', topic, 'Difficoltà:', difficulty);

  // Randomizza ulteriormente l'argomento e la difficoltà per maggiore casualità
  const topics = ['algebra', 'derivatives', 'integrals'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  
  // 30% delle volte cambia casualmente l'argomento
  if (Math.random() < 0.3) {
    const randomIndex = Math.floor(Math.random() * topics.length);
    topic = topics[randomIndex];
    console.log('🎲 Argomento cambiato casualmente a:', topic);
  }
  
  // 30% delle volte cambia casualmente la difficoltà
  if (Math.random() < 0.3) {
    const randomIndex = Math.floor(Math.random() * difficulties.length);
    difficulty = difficulties[randomIndex];
    console.log('🎲 Difficoltà cambiata casualmente a:', difficulty);
  }

  // Genera un problema casuale
  const randomProblem = generateRandomProblem(topic, difficulty);
  
  // Dati sessione
  currentSession = {
    sessionId: 'random-session-' + Date.now(),
    currentStep: 0,
    totalSteps: randomProblem.steps.length,
    isCompleted: false,
    isRandomMode: true
  };
    
  currentProblem = {
    id: `random-${topic}-${difficulty}-${Date.now()}`,
    problem: randomProblem.equation || randomProblem.problem,
    equation: randomProblem.equation || randomProblem.problem,
    description: randomProblem.description,
    difficulty: randomProblem.difficulty,
    topic: randomProblem.topic,
    steps: randomProblem.steps || [],
    solution: randomProblem.solution
  };
  console.log('🎲 Problema casuale creato:', currentProblem);
  
  // Aggiorna l'interfaccia con il nuovo problema
  console.log('🔄 Aggiornamento interfaccia con problema casuale');
  if (typeof updateProblemDisplay === 'function') {
    updateProblemDisplay(currentProblem, topic);
    console.log('✅ Interfaccia aggiornata correttamente');
  } else {
    console.error('❌ Funzione updateProblemDisplay non trovata - assicurarsi che sia definita nel file HTML');
  }
  
  // Cancella eventuali log di soluzioni precedenti
  if (typeof clearSolutionLog === 'function') {
    clearSolutionLog();
  } else {
    console.warn('⚠️ Funzione clearSolutionLog non trovata - potrebbe non essere necessaria');
  }
  
  // Assicurarsi che non ci siano avvisi di modalità casuale visibili
  console.log('ℹ️ L\'avviso di modalità casuale è stato disabilitato come richiesto');
  hideRandomModeNotice();
  // showRandomModeNotice(); // Commentato per non mostrare l'avviso
}

/**
 * Mostra un indicatore visivo per informare l'utente che è in modalità casuale
 * Crea un banner colorato e animato nella parte superiore dell'interfaccia
 */
function showRandomModeNotice() {
  console.log('🎲 Mostrando indicatore modalità casuale');
  
  // Rimuovi eventuali notifiche precedenti
  const existingNotice = document.getElementById('random-mode-notice');
  if (existingNotice) {
    existingNotice.remove();
  }
  
  // Crea il nuovo elemento di notifica
  const noticeElement = document.createElement('div');
  noticeElement.id = 'random-mode-notice';
  noticeElement.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-50 py-3 px-6 rounded-full shadow-lg';
  noticeElement.style.background = 'linear-gradient(45deg, #f97316, #ec4899, #8b5cf6)';
  noticeElement.style.backgroundSize = '200% 200%';
  noticeElement.style.animation = 'gradientShift 3s ease infinite, bounce 2s ease-in-out infinite';
  
  // Crea il contenuto della notifica
  const content = document.createElement('div');
  content.className = 'flex items-center gap-2';
  
  // Icona del dado
  const diceIcon = document.createElement('span');
  diceIcon.textContent = '🎲';
  diceIcon.className = 'text-xl animate-spin';
  diceIcon.style.animationDuration = '3s';
  
  // Testo della notifica
  const noticeText = document.createElement('span');
  noticeText.textContent = 'Modalità Casuale Attiva';
  noticeText.className = 'text-white font-bold';
  
  // Assembla gli elementi
  content.appendChild(diceIcon);
  content.appendChild(noticeText);
  noticeElement.appendChild(content);
  
  // Aggiungi animazione CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes bounce {
      0%, 100% { transform: translateY(0) translateX(-50%); }
      50% { transform: translateY(-10px) translateX(-50%); }
    }
  `;
  document.head.appendChild(style);
  
  // Aggiungi al DOM
  document.body.appendChild(noticeElement);
  
  // Aggiungi anche un indicatore nell'interfaccia principale (card del problema)
  const problemCard = document.querySelector('.problem-card');
  if (problemCard) {
    // Rimuovi badge esistenti
    const existingBadge = problemCard.querySelector('.random-mode-badge');
    if (existingBadge) {
      existingBadge.remove();
    }
    
    const randomBadge = document.createElement('div');
    randomBadge.className = 'random-mode-badge absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1';
    randomBadge.innerHTML = '<span>🎲</span> <span>Casuale</span>';
    
    // Aggiungi una posizione relativa al problem card se non ce l'ha già
    if (window.getComputedStyle(problemCard).position === 'static') {
      problemCard.style.position = 'relative';
    }
    
    problemCard.appendChild(randomBadge);
  }
  
  // Aggiungi un altro indicatore visivo alla card principale
  const mainCardContent = document.querySelector('.main-card-content');
  if (mainCardContent) {
    // Aggiungi un bordo animato
    mainCardContent.style.borderWidth = '2px';
    mainCardContent.style.borderStyle = 'solid';
    mainCardContent.style.borderColor = 'transparent';
    mainCardContent.style.borderImage = 'linear-gradient(45deg, #f97316, #ec4899, #8b5cf6) 1';
    mainCardContent.style.animation = 'gradientShift 3s ease infinite';
  }
}

/**
 * Nasconde l'indicatore di modalità casuale, rimuovendo il banner e il badge
 */
function hideRandomModeNotice() {
  console.log('🚫 Nascondendo indicatore modalità casuale');
  
  // Rimuovi il banner di modalità casuale
  const noticeElement = document.getElementById('random-mode-notice');
  if (noticeElement) {
    noticeElement.remove();
  }
  
  // Rimuovi il badge di modalità casuale dalla card del problema
  const problemCard = document.querySelector('.problem-card');
  if (problemCard) {
    const existingBadge = problemCard.querySelector('.random-mode-badge');
    if (existingBadge) {
      existingBadge.remove();
    }
  }
  
  // Rimuovi eventuali stili di animazione dalla card principale
  const mainCardContent = document.querySelector('.main-card-content');
  if (mainCardContent) {
    mainCardContent.style.borderWidth = '';
    mainCardContent.style.borderStyle = '';
    mainCardContent.style.borderColor = '';
    mainCardContent.style.borderImage = '';
    mainCardContent.style.animation = '';
  }
}

/**
 * Mostra lo stato di caricamento durante la generazione di un nuovo problema
 */
function showLoadingState() {
  console.log('⏳ Mostrando stato di caricamento');
  
  // Cerca l'elemento di descrizione del problema
  const problemDescription = document.getElementById('problem-description');
  if (problemDescription) {
    // Salva il contenuto originale
    if (!problemDescription.getAttribute('data-original')) {
      problemDescription.setAttribute('data-original', problemDescription.innerHTML);
    }
    
    // Mostra l'animazione di caricamento
    problemDescription.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 008-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Generando un problema casuale...</span>
      </div>
    `;
  }
  
  // Disabilita il pulsante "New Problem" durante il caricamento
  const newProblemBtn = document.getElementById('new-problem-btn');
  if (newProblemBtn) {
    newProblemBtn.disabled = true;
  }
}

/**
 * Cancella il log delle soluzioni precedenti
 */
function clearSolutionLog() {
  console.log('🧹 Cancellazione log soluzioni precedenti');
  
  // Cerca l'elemento che contiene i passaggi della soluzione
  const solutionLog = document.querySelector('.solution-steps');
  if (solutionLog) {
    // Reimposta il contenuto
    solutionLog.innerHTML = `
      <div class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </div>
        <p class="text-gray-500 text-sm">Inizia a inserire i passaggi della tua soluzione nel pannello a destra.</p>
        <p class="text-gray-400 text-xs mt-1">Ogni passaggio apparirà qui per la revisione.</p>
      </div>
    `;
  }
  
  // Riabilita il pulsante "New Problem"
  const newProblemBtn = document.getElementById('new-problem-btn');
  if (newProblemBtn) {
    newProblemBtn.disabled = false;
  }
}

/**
 * Aggiorna l'interfaccia con il nuovo problema
 * Questa funzione è un wrapper che chiama la funzione updateProblemDisplay definita nell'HTML
 */
function updateProblemDisplay(problem, topic) {
  console.log('🔄 [JS] Aggiornamento interfaccia con problema:', problem);
  
  // Controlla se esiste già una funzione updateProblemDisplay definita nell'HTML
  if (window.updateProblemDisplay && typeof window.updateProblemDisplay === 'function') {
    // Usa la funzione definita nell'HTML
    window.updateProblemDisplay(problem);
  } else {
    console.warn('⚠️ Funzione updateProblemDisplay non trovata in window, implementazione JS in uso');
    
    // Implementazione di fallback
    try {
      // Aggiorna il badge del topic
      const topicBadge = document.getElementById('topic-badge');
      if (topicBadge) {
        topicBadge.textContent = problem.topic.charAt(0).toUpperCase() + problem.topic.slice(1);
      }
      
      // Aggiorna il badge della difficoltà
      const difficultyBadge = document.getElementById('difficulty-badge');
      if (difficultyBadge) {
        difficultyBadge.textContent = problem.difficulty;
        
        // Aggiorna il colore del badge in base alla difficoltà
        difficultyBadge.className = 'px-3 py-1 text-xs font-medium rounded-full ';
        if (problem.difficulty === 'Beginner') {
          difficultyBadge.className += 'bg-green-100 text-green-800';
        } else if (problem.difficulty === 'Intermediate') {
          difficultyBadge.className += 'bg-yellow-100 text-yellow-800';
        } else if (problem.difficulty === 'Advanced') {
          difficultyBadge.className += 'bg-red-100 text-red-800';
        }
      }
      
      // Aggiorna la descrizione del problema
      const problemDescription = document.getElementById('problem-description');
      if (problemDescription) {
        const descriptionText = problem.description || 'Risolvi l\'equazione';
        const equationSpan = `<span id="problem-equation" class="font-mono bg-white px-3 py-1 rounded-lg shadow-sm">${problem.equation}</span>`;
        problemDescription.innerHTML = `${descriptionText}: ${equationSpan}`;
      }
      
      // Aggiorna l'equazione stand-alone (se esiste)
      const problemEquation = document.getElementById('problem-equation');
      if (problemEquation) {
        problemEquation.textContent = problem.equation;
      }
      
      console.log('✅ [JS] Interfaccia aggiornata correttamente');
    } catch (error) {
      console.error('❌ [JS] Errore durante l\'aggiornamento dell\'interfaccia:', error);
    }
  }
}

/**
 * Mostra un messaggio all'utente in caso di problemi con il backend
 */
function showBackendError() {
  console.log('❌ Mostrando messaggio di errore backend');
  
  // Crea o aggiorna l'elemento di errore
  let errorElement = document.getElementById('backend-error-message');
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = 'backend-error-message';
    errorElement.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white shadow-lg rounded-lg p-4';
    errorElement.style.width = '90%';
    errorElement.style.maxWidth = '400px';
    errorElement.style.textAlign = 'center';
    errorElement.style.border = '1px solid #e5e7eb';
    errorElement.style.backgroundColor = '#f9fafb';
    
    // Aggiungi animazione di apparizione
    errorElement.style.opacity = '0';
    errorElement.style.transition = 'opacity 0.5s ease';
    
    document.body.appendChild(errorElement);
  }
  
  // Imposta il contenuto dell'errore
  errorElement.innerHTML = `
    <div class="flex items-center justify-center mb-2">
      <svg class="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M12 4a8 8 0 100 16 8 8 0 000-16z"/>
      </svg>
      <span class="text-red-500 font-semibold">Errore di connessione</span>
    </div>
    <div class="text-sm text-gray-600 mb-4">
      Impossibile contattare il server. Verifica la tua connessione a Internet o riprova più tardi.
    </div>
    <button id="retry-button" class="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-red-600 transition-all">
      Riprova
    </button>
  `;
  
  // Mostra l'elemento di errore con animazione
  setTimeout(() => {
    errorElement.style.opacity = '1';
  }, 50);
  
  // Aggiungi gestore per il pulsante di ripristino
  const retryButton = document.getElementById('retry-button');
  if (retryButton) {
    retryButton.addEventListener('click', () => {
      location.reload();
    });
  }
}

// Add validateUserInput function to validate user-submitted math steps
function validateUserInput(input) {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      message: 'Input is empty or not valid. Please enter a mathematical expression.'
    };
  }

  // Trim the input
  input = input.trim();

  // Basic validation: check if it's not empty
  if (input.length === 0) {
    return {
      isValid: false,
      message: 'Please enter your solution step.'
    };
  }

  // Check if it contains a mathematical expression (basic check)
  // This looks for numbers, variables, operators, etc.
  const mathPattern = /[0-9x-z+\-*/()=<>≤≥²³^√]/i;
  if (!mathPattern.test(input)) {
    return {
      isValid: false,
      message: 'Please enter a valid mathematical expression.'
    };
  }

  // If we're checking for an equation, make sure it has an equals sign
  if (currentProblem && currentProblem.problem && currentProblem.problem.includes('=')) {
    if (!input.includes('=')) {
      return {
        isValid: false,
        message: 'Please enter an equation with an equals sign (=).'
      };
    }
  }

  // If we got here, the input is basically valid
  return {
    isValid: true,
    message: 'Input is valid.'
  };
}

// Function to validate mathematical step against the correct solution
function validateMathStepLocal(userStep, correctSteps, currentStepIndex, originalEquation) {
  // First perform basic validation
  const basicValidation = validateUserInput(userStep);
  if (!basicValidation.isValid) {
    return {
      isValid: false,
      nextStepIndex: currentStepIndex,
      feedback: basicValidation.message
    };
  }

  // If enhanced validation is available, use it
  if (window.validateMathStep && typeof window.validateMathStep === 'function') {
    return window.validateMathStep(userStep, correctSteps, currentStepIndex, originalEquation);
  }

  // Fallback: Simple validation (exact match)
  const normalizedUserStep = userStep.replace(/\s+/g, '').toLowerCase();
  
  // Check if step matches any of the correct steps
  for (let i = currentStepIndex; i < correctSteps.length; i++) {
    const normalizedCorrectStep = correctSteps[i].replace(/\s+/g, '').toLowerCase();
    
    if (normalizedUserStep === normalizedCorrectStep) {
      return {
        isValid: true,
        nextStepIndex: i + 1,
        feedback: 'Correct step!'
      };
    }
  }
  
  // If no match found
  return {
    isValid: false,
    nextStepIndex: currentStepIndex,
    feedback: 'This step doesn\'t appear to be correct. Try again.'
  };
}

// Esponiamo le funzioni al contesto globale per permettere la chiamata dal file HTML
if (typeof window !== 'undefined') {
  window.jsInitializeNewProblem = initializeNewProblem;
  window.jsUseRandomProblems = useRandomProblems;
  window.jsGenerateRandomProblem = generateRandomProblem;
  // window.jsShowRandomModeNotice = showRandomModeNotice; // Commentato per evitare che venga mostrato l'avviso
  window.jsHideRandomModeNotice = hideRandomModeNotice;
  
  // Sovrascriviamo la funzione initializeNewProblem nell'HTML quando il modulo è caricato
  window.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 Modulo JavaScript caricato, sovrascrittura funzioni HTML...');
    window.initializeNewProblem = initializeNewProblem;
    console.log('✅ Funzione initializeNewProblem sovrascritta correttamente');
  });
}

/**
 * Funzione principale per la generazione di problemi matematici casuali
 * Può essere chiamata direttamente dal contesto globale (es. pulsante "Nuovo Problema")
 */
function generateMathProblem() {
  console.log('➕ Generazione di un nuovo problema matematico');
  
  // Usa argomento e difficoltà selezionati
  const topic = selectedTopic || 'algebra';
  const difficulty = selectedDifficulty || 'Beginner';
  
  // Inizializza un nuovo problema
  initializeNewProblem(topic, difficulty);
}

// Aggiungi gestore per il pulsante "Nuovo Problema"
const newProblemButton = document.getElementById('new-problem-btn');
if (newProblemButton) {
  newProblemButton.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Mostra un messaggio di conferma prima di generare un nuovo problema
    Swal.fire({
      title: 'Sei sicuro?',
      text: "Vuoi davvero generare un nuovo problema? Tutti i progressi attuali saranno persi.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#f44336',
      confirmButtonText: 'Sì, genera!',
      cancelButtonText: 'Annulla'
    }).then((result) => {
      if (result.isConfirmed) {
        // Confermato: genera un nuovo problema
        console.log('✅ Confermato: generazione nuovo problema');
        generateMathProblem();
      } else {
        // Annullato
        console.log('❌ Generazione problema annullata');
      }
    });
  });
} else {
  console.warn('⚠️ Pulsante "Nuovo Problema" non trovato nel DOM');
}

// Funzione per generare problemi matematici casuali
function generateRandomProblem(topic, difficulty) {
  const difficultyLevels = {
    'Beginner': 1,
    'Intermediate': 2,
    'Advanced': 3
  };
  
  const level = difficultyLevels[difficulty] || 1;
  
  // Genera problemi in base all'argomento
  switch(topic.toLowerCase()) {
    case 'algebra':
      return generateAlgebraicProblem(level);
    case 'derivatives':
      return generateDerivativeProblem(level);
    case 'integrals':
      return generateIntegralProblem(level);
    default:
      return generateAlgebraicProblem(level);
  }
}

// Generatore di problemi algebrici
function generateAlgebraicProblem(level) {
  // Genera numeri casuali per l'equazione
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  let problem, steps, solution;
  
  // Genera problemi in base al livello di difficoltà
  if (level === 1) {
    // Livello principiante: equazioni lineari semplici (ax + b = c)
    const a = random(2, 10);
    const b = random(1, 20);
    const c = random(10, 30);
    const x = (c - b) / a;
    
    problem = `${a}x + ${b} = ${c}`;
    steps = [
      `${a}x + ${b} = ${c}`,
      `${a}x = ${c} - ${b}`,
      `${a}x = ${c - b}`,
      `x = ${c - b} / ${a}`,
      `x = ${x}`
    ];
    solution = `x = ${x}`;
  } 
  else if (level === 2) {
    // Livello intermedio: equazioni quadratiche (ax² + bx + c = 0)
    // Genera coefficienti che producano soluzioni intere
    const r1 = random(-5, 5);
    const r2 = random(-5, 5);
    const a = random(1, 3);
    const b = -a * (r1 + r2);
    const c = a * r1 * r2;
    
    problem = `${a}x² + ${b}x + ${c} = 0`;
    
    if (r1 === r2) {
      // Soluzione doppia
      steps = [
        `${a}x² + ${b}x + ${c} = 0`,
        `(x - ${r1})² = 0`,
        `x = ${r1}`
      ];
      solution = `x = ${r1}`;
    } else {
      steps = [
        `${a}x² + ${b}x + ${c} = 0`,
        `x² + ${b/a}x + ${c/a} = 0`,
        `(x - ${r1})(x - ${r2}) = 0`,
        `x = ${r1} o x = ${r2}`
      ];
      solution = `x = ${r1} o x = ${r2}`;
    }
  } 
  else {
    // Livello avanzato: sistemi di equazioni lineari
    const a1 = random(1, 5);
    const b1 = random(1, 5);
    const a2 = random(1, 5);
    const b2 = random(1, 5);
    
    // Genera soluzioni intere
    const x = random(1, 10);
    const y = random(1, 10);
    
    const c1 = a1 * x + b1 * y;
    const c2 = a2 * x + b2 * y;
    
    problem = `${a1}x + ${b1}y = ${c1}, ${a2}x + ${b2}y = ${c2}`;
    steps = [
      `${a1}x + ${b1}y = ${c1}`,
      `${a2}x + ${b2}y = ${c2}`,
      `x = (${c1} - ${b1}y) / ${a1}`,
      `${a2}((${c1} - ${b1}y) / ${a1}) + ${b2}y = ${c2}`,
      `${b2 - (a2*b1)/a1}y = ${c2 - (a2*c1)/a1}`,
      `y = ${y}`,
      `x = ${x}`
    ];
    solution = `x = ${x}, y = ${y}`;
  }
  
  return {
    problem: problem,
    equation: problem,
    description: "Risolvi l'equazione:",
    difficulty: ['Beginner', 'Intermediate', 'Advanced'][level - 1],
    topic: 'algebra',
    steps: steps,
    solution: solution
  };
}

// Generatore di problemi di derivate
function generateDerivativeProblem(level) {
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  let problem, description, steps, solution;
  
  if (level === 1) {
    // Livello principiante: derivate di funzioni polinomiali
    const a = random(1, 10);
    const n = random(1, 3);
    
    problem = `f(x) = ${a}x^${n}`;
    description = "Calcola la derivata:";
    steps = [
      `f(x) = ${a}x^${n}`,
      `f'(x) = ${a} · ${n} · x^${n-1}`,
      `f'(x) = ${a*n}x^${n-1}`
    ];
    solution = `f'(x) = ${a*n}x^${n-1}`;
  } 
  else if (level === 2) {
    // Livello intermedio: derivate di funzioni trigonometriche
    const trigFuncs = ['sin', 'cos', 'tan'];
    const idx = random(0, 2);
    const func = trigFuncs[idx];
    const a = random(1, 5);
    
    problem = `f(x) = ${func}(${a}x)`;
    description = "Calcola la derivata:";
    
    if (func === 'sin') {
      steps = [
        `f(x) = sin(${a}x)`,
        `f'(x) = cos(${a}x) · ${a}`,
        `f'(x) = ${a}cos(${a}x)`
      ];
      solution = `f'(x) = ${a}cos(${a}x)`;
    } 
    else if (func === 'cos') {
      steps = [
        `f(x) = cos(${a}x)`,
        `f'(x) = -sin(${a}x) · ${a}`,
        `f'(x) = -${a}sin(${a}x)`
      ];
      solution = `f'(x) = -${a}sin(${a}x)`;
    } 
    else {
      steps = [
        `f(x) = tan(${a}x)`,
        `f'(x) = sec²(${a}x) · ${a}`,
        `f'(x) = ${a}sec²(${a}x)`
      ];
      solution = `f'(x) = ${a}sec²(${a}x)`;
    }
  } 
  else {
    // Livello avanzato: regola del prodotto/quoziente
    const choice = random(0, 1); // 0: prodotto, 1: quoziente
    
    if (choice === 0) {
      // Regola del prodotto
      const a = random(1, 5);
      const n = random(1, 3);
      
      problem = `f(x) = ${a}x^${n} · ln(x)`;
      description = "Calcola la derivata usando la regola del prodotto:";
      steps = [
        `f(x) = ${a}x^${n} · ln(x)`,
        `f'(x) = (${a}x^${n})' · ln(x) + ${a}x^${n} · (ln(x))'`,
        `f'(x) = ${a*n}x^${n-1} · ln(x) + ${a}x^${n} · (1/x)`,
        `f'(x) = ${a*n}x^${n-1} · ln(x) + ${a}x^${n-1}`
      ];
      solution = `f'(x) = ${a*n}x^${n-1} · ln(x) + ${a}x^${n-1}`;
    } 
    else {
      // Regola del quoziente
      const a = random(1, 5);
      const n = random(1, 3);
      
      problem = `f(x) = ${a}x^${n} / (x+1)`;
      description = "Calcola la derivata usando la regola del quoziente:";
      steps = [
        `f(x) = ${a}x^${n} / (x+1)`,
        `f'(x) = [(${a}x^${n})' · (x+1) - ${a}x^${n} · (x+1)'] / (x+1)²`,
        `f'(x) = [${a*n}x^${n-1} · (x+1) - ${a}x^${n} · 1] / (x+1)²`,
        `f'(x) = [${a*n}x^${n-1}(x+1) - ${a}x^${n}] / (x+1)²`,
        `f'(x) = [${a*n}x^${n} + ${a*n}x^${n-1} - ${a}x^${n}] / (x+1)²`,
        `f'(x) = [${a*(n-1)}x^${n} + ${a*n}x^${n-1}] / (x+1)²`
      ];
      solution = `f'(x) = [${a*(n-1)}x^${n} + ${a*n}x^${n-1}] / (x+1)²`;
    }
  }
  
  return {
    problem: problem,
    equation: problem,
    description: description,
    difficulty: ['Beginner', 'Intermediate', 'Advanced'][level - 1],
    topic: 'derivatives',
    steps: steps,
    solution: solution
  };
}

// Generatore di problemi di integrali
function generateIntegralProblem(level) {
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  let problem, description, steps, solution;
  
  if (level === 1) {
    // Livello principiante: integrali di funzioni polinomiali
    const a = random(1, 10);
    const n = random(1, 3);
    
    problem = `∫ ${a}x^${n} dx`;
    description = "Calcola l'integrale:";
    steps = [
      `∫ ${a}x^${n} dx`,
      `${a} · ∫ x^${n} dx`,
      `${a} · [x^(${n}+1)/(${n}+1)] + C`,
      `${a}x^${n+1}/${n+1} + C`,
      `${a/(n+1)}x^${n+1} + C`
    ];
    solution = `${a/(n+1)}x^${n+1} + C`;
  } 
  else if (level === 2) {
    // Livello intermedio: integrazione per parti
    const a = random(1, 5);
    
    problem = `∫ ${a}x · e^x dx`;
    description = "Calcola l'integrale usando l'integrazione per parti:";
    steps = [
      `∫ ${a}x · e^x dx`,
      `u = ${a}x, dv = e^x dx`,
      `du = ${a}dx, v = e^x`,
      `= ${a}x · e^x - ∫ ${a} · e^x dx`,
      `= ${a}x · e^x - ${a} · ∫ e^x dx`,
      `= ${a}x · e^x - ${a}e^x + C`,
      `= ${a}e^x(x - 1) + C`
    ];
    solution = `${a}e^x(x - 1) + C`;
  } 
  else {
    // Livello avanzato: integrali trigonometrici
    problem = `∫ sin²(x) · cos(x) dx`;
    description = "Calcola l'integrale trigonometrico:";
    steps = [
      `∫ sin²(x) · cos(x) dx`,
      `Sostituisci u = sin(x), du = cos(x) dx`,
      `∫ u² · du`,
      `u³/3 + C`,
      `sin³(x)/3 + C`
    ];
    solution = `sin³(x)/3 + C`;
  }
  
  return {
    problem: problem,
    equation: problem,
    description: description,
    difficulty: ['Beginner', 'Intermediate', 'Advanced'][level - 1],
    topic: 'integrals',
    steps: steps,
    solution: solution
  };
}

// Function to update user information in the UI
async function updateUserInfo() {
  try {
    // First try to get user from Supabase auth
    const { data: { session } } = await supabase.auth.getSession();
    
    // Check if legacy authentication is used as fallback
    const legacyUser = localStorage.getItem('user_logged_in');
    const userEmail = session?.user?.email || localStorage.getItem('user_email');
    
    // Update user display elements if they exist
    const userNicknameElement = document.getElementById('user-nickname');
    const userInitialElement = document.getElementById('user-initial');
    
    if (userEmail && userNicknameElement) {
      // Generate nickname from email (part before @)
      const nickname = userEmail.split('@')[0];
      userNicknameElement.textContent = nickname;
    }
    
    if (userEmail && userInitialElement) {
      // Generate initial from email
      const initial = userEmail.charAt(0).toUpperCase();
      userInitialElement.textContent = initial;
    }
    
    // Set up logout button functionality
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', async () => {
        // Clear all authentication data
        if (session) {
          await supabase.auth.signOut();
        }
        
        // Clear legacy auth data
        localStorage.removeItem('user_logged_in');
        localStorage.removeItem('user_email');
        
        // Redirect to home page
        window.location.href = '/index.html';
      });
    }
    
    return !!session || !!legacyUser;
  } catch (error) {
    console.error('Error updating user info:', error);
    return false;
  }
}

// Function to handle user solution submission
function setupEventHandlers() {
  console.log('🔄 Setting up event handlers');
  
  // Get input field and send button
  const inputField = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');
  
  if (!inputField || !sendButton) {
    console.error('❌ Required DOM elements not found');
    return;
  }
  
  // Set up event listener for the send button
  sendButton.addEventListener('click', () => {
    handleSolutionSubmit();
  });
  
  // Set up event listener for Enter key in the input field
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSolutionSubmit();
    }
  });
  
  console.log('✅ Event handlers set up successfully');
}

// Function to handle the submission of a solution step
function handleSolutionSubmit() {
  console.log('📤 Handling solution submission');
  
  // Get the input field
  const inputField = document.getElementById('chat-input');
  if (!inputField) {
    console.error('❌ Input field not found');
    return;
  }
  
  // Get the user input
  const userInput = inputField.value.trim();
  
  // Basic validation
  if (!userInput) {
    // Use SweetAlert for error message
    Swal.fire({
      title: 'Input Required',
      text: 'Please enter your solution step.',
      icon: 'warning',
      confirmButtonText: 'OK'
    });
    return;
  }
  
  // Make sure a problem is loaded
  if (!currentProblem || !currentSession) {
    console.error('❌ No active problem or session');
    Swal.fire({
      title: 'No Active Problem',
      text: 'Please start a new problem first.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
    return;
  }
  
  // Process the input
  processUserStep(userInput);
  
  // Clear the input field
  inputField.value = '';
}

// Function to process a user solution step
async function processUserStep(userStep) {
  console.log('🧮 Processing user step:', userStep);
  
  try {
    // First, perform basic validation
    const validation = validateUserInput(userStep);
    if (!validation.isValid) {
      console.warn('⚠️ Input validation failed:', validation.message);
      
      Swal.fire({
        title: 'Invalid Input',
        text: validation.message,
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    // If we're in development/random mode, use local validation
    if (currentSession.isDevelopmentMode || currentSession.isRandomMode) {
      console.log('🔍 Using local validation in development/random mode');
      
      const result = validateMathStepLocal(
        userStep,
        currentProblem.steps,
        currentSession.currentStep,
        currentProblem.problem || currentProblem.equation
      );
      
      // Process the validation result
      processValidationResult(userStep, result);
      return;
    }
    
    // Otherwise, call the backend API
    console.log('🌐 Sending step to backend for validation');
    
    const response = await fetch(`${supabase.supabaseUrl}${CONFIG.ENDPOINTS.VALIDATE_STEP}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.supabaseKey}`
      },
      body: JSON.stringify({
        sessionId: currentSession.sessionId,
        userStep: userStep
      })
    });
    
    if (!response.ok) {
      throw new Error(`Backend validation failed (HTTP ${response.status})`);
    }
    
    const result = await response.json();
    
    // Process the validation result
    processValidationResult(userStep, result);
    
  } catch (error) {
    console.error('❌ Error processing user step:', error);
    
    // Fallback to local validation if backend fails
    console.log('⚠️ Backend validation failed, falling back to local validation');
    
    const result = validateMathStepLocal(
      userStep,
      currentProblem.steps,
      currentSession.currentStep,
      currentProblem.problem || currentProblem.equation
    );
    
    // Process the validation result
    processValidationResult(userStep, result);
  }
}

// Function to process validation result and update UI
function processValidationResult(userStep, result) {
  console.log('🔍 Processing validation result:', result);
  
  // Add the step to the solution log
  addStepToLog(userStep, result.isValid, result.isCompleted, false, false, false, false);
  
  // Update current step index
  if (result.isValid) {
    currentSession.currentStep = result.nextStepIndex;
    
    // Check if the problem is completed
    if (result.isCompleted || currentSession.currentStep >= currentProblem.steps.length) {
      currentSession.isCompleted = true;
      
      // Show completion message
      Swal.fire({
        title: 'Great job!',
        text: 'You have successfully solved the problem!',
        icon: 'success',
        confirmButtonText: 'Continue'
      });
    }
  }
}

// Function to add a step to the solution log
function addStepToLog(input, isCorrect, isComplete, isOriginal, isSkipped, isRepeated, isAlternative) {
  console.log('📝 Adding step to log:', { 
    input, isCorrect, isComplete, isOriginal, isSkipped, isRepeated, isAlternative 
  });
  
  // Get the solution log container
  const solutionLog = document.querySelector('.solution-steps');
  if (!solutionLog) {
    console.error('❌ Solution log container not found');
    return;
  }
  
  // Clear placeholder if this is the first step
  if (solutionLog.querySelector('.text-center')) {
    solutionLog.innerHTML = '';
  }
  
  // Create step element
  const stepElement = document.createElement('div');
  stepElement.className = 'step-entry bg-white p-4 rounded-xl shadow-sm flex items-start gap-3 border-l-4 transition-all duration-300';
  
  // Set border color based on result
  if (isCorrect) {
    if (isComplete) {
      stepElement.classList.add('border-green-500', 'bg-green-50');
    } else if (isOriginal) {
      stepElement.classList.add('border-blue-500', 'bg-blue-50');
    } else if (isAlternative) {
      stepElement.classList.add('border-purple-500', 'bg-purple-50');
    } else {
      stepElement.classList.add('border-green-500');
    }
  } else {
    stepElement.classList.add('border-red-500', 'bg-red-50');
  }
  
  // Create status icon
  const iconDiv = document.createElement('div');
  iconDiv.className = 'flex-shrink-0';
  
  if (isCorrect) {
    if (isComplete) {
      iconDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      `;
    } else if (isOriginal) {
      iconDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      `;
    } else {
      iconDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      `;
    }
  } else {
    iconDiv.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </div>
    `;
  }
  
  // Create content div
  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-grow';
  
  // Step input (show as code)
  const stepContent = document.createElement('div');
  stepContent.className = 'font-mono bg-gray-50 p-2 rounded mb-2 text-gray-800';
  stepContent.textContent = input;
  
  // Feedback message
  const feedbackDiv = document.createElement('div');
  
  if (isCorrect) {
    if (isComplete) {
      feedbackDiv.className = 'text-sm text-green-700';
      feedbackDiv.textContent = 'Problem solved! Great job!';
    } else if (isOriginal) {
      feedbackDiv.className = 'text-sm text-blue-700';
      feedbackDiv.textContent = 'Equation restated. Good starting point!';
    } else if (isRepeated) {
      feedbackDiv.className = 'text-sm text-yellow-700';
      feedbackDiv.textContent = 'Step repeated. Try the next step in the solution.';
    } else {
      feedbackDiv.className = 'text-sm text-green-700';
      feedbackDiv.textContent = 'Correct step! Continue to the next step.';
    }
  } else {
    feedbackDiv.className = 'text-sm text-red-700';
    feedbackDiv.textContent = 'This step doesn\'t seem correct. Try again.';
  }
  
  // Assemble the elements
  contentDiv.appendChild(stepContent);
  contentDiv.appendChild(feedbackDiv);
  stepElement.appendChild(iconDiv);
  stepElement.appendChild(contentDiv);
  
  // Add to the solution log
  solutionLog.appendChild(stepElement);
  
  // Scroll to the new step
  stepElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// Function to reset the solution state for a new problem
function resetSolutionState() {
  console.log('🔄 Resetting solution state');
  
  // Reset the current step
  if (currentSession) {
    currentSession.currentStep = 0;
    currentSession.isCompleted = false;
  }
  
  // Clear the solution log
  clearSolutionLog();
}

// Initialize difficulty selector
function initializeDifficultySelector() {
  // Get the difficulty buttons container
  const difficultyButtons = document.querySelectorAll('.difficulty-btn');
  const difficultyDescription = document.getElementById('difficulty-description');
  
  // If elements don't exist, return early
  if (!difficultyButtons.length || !difficultyDescription) {
    console.error('Difficulty selector elements not found');
    return;
  }

  // Set initial active state based on selectedDifficulty
  difficultyButtons.forEach(button => {
    const buttonDifficulty = button.getAttribute('data-difficulty');
    
    // If this is the selected difficulty, mark it as active
    if (buttonDifficulty === selectedDifficulty) {
      button.classList.add('active');
      updateDifficultyDescription(selectedDifficulty);
    }
    
    // Add click event listener to each button
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      difficultyButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Update selected difficulty
      selectedDifficulty = buttonDifficulty;
      console.log('Selected difficulty:', selectedDifficulty);
      
      // Update the description
      updateDifficultyDescription(selectedDifficulty);
    });
  });
  
  // Also set up the new problem button
  const newProblemBtn = document.getElementById('new-problem-btn');
  if (newProblemBtn) {
    newProblemBtn.addEventListener('click', async () => {
      await initializeNewProblem(selectedTopic, selectedDifficulty);
    });
  }
}

// Function to update the difficulty description
function updateDifficultyDescription(difficulty) {
  const difficultyDescription = document.getElementById('difficulty-description');
  if (!difficultyDescription) return;
  
  switch (difficulty) {
    case 'Beginner':
      difficultyDescription.innerHTML = '<span class="font-medium">Beginner:</span> Basic equations and simple operations';
      break;
    case 'Intermediate':
      difficultyDescription.innerHTML = '<span class="font-medium">Intermediate:</span> Multi-step problems with more complex operations';
      break;
    case 'Advanced':
      difficultyDescription.innerHTML = '<span class="font-medium">Advanced:</span> Challenging problems requiring deep understanding';
      break;
    default:
      difficultyDescription.innerHTML = '<span class="font-medium">Beginner:</span> Basic equations and simple operations';
  }
}
