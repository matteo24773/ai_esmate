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
    // Show loading state
    showLoadingState();
    
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

  const mockProblems = {
    algebra: {
      'Beginner': [
        {
          problem: "2x + 5 = 13",
          equation: "2x + 5 = 13",
          description: "Solve for x:",
          difficulty: "Beginner",
          topic: "algebra",
          // Only mathematical steps, not descriptions
          steps: ['2x + 5 = 13', '2x = 13 - 5', '2x = 8', 'x = 8 / 2', 'x = 4'],
          solution: 'x = 4'
        },
        {
          problem: "x + 12 = 20",
          equation: "x + 12 = 20",
          description: "Solve for x:",
          difficulty: "Beginner", 
          topic: "algebra",
          steps: ['x + 12 = 20', 'x = 20 - 12', 'x = 8'],
          solution: 'x = 8'
        },
        {
          problem: "x - 7 = 15",
          equation: "x - 7 = 15",
          description: "Solve for x:",
          difficulty: "Beginner", 
          topic: "algebra",
          steps: ['x - 7 = 15', 'x = 15 + 7', 'x = 22'],
          solution: 'x = 22'
        }
      ],      'Intermediate': [
        {
          problem: "3x² - 12x + 9 = 0",
          equation: "3x² - 12x + 9 = 0",
          description: "Solve the quadratic equation:",
          difficulty: "Intermediate",
          topic: "algebra",
          steps: ['3(x² - 4x + 3) = 0', 'x² - 4x + 3 = 0', '(x - 1)(x - 3) = 0', 'x = 1 or x = 3'],
          solution: 'x = 1 or x = 3'
        },
        {
          problem: "2x + 3y = 12, x - y = 1",
          equation: "2x + 3y = 12, x - y = 1",
          description: "Solve the system of equations:",
          difficulty: "Intermediate",
          topic: "algebra",
          steps: ['x = y + 1', '2(y + 1) + 3y = 12', '2y + 2 + 3y = 12', '5y = 10', 'y = 2', 'x = 3'],
          solution: 'x = 3, y = 2'
        }
      ],      'Advanced': [
        {
          problem: "x³ - 6x² + 11x - 6 = 0",
          equation: "x³ - 6x² + 11x - 6 = 0",
          description: "Solve the cubic equation:",
          difficulty: "Advanced",
          topic: "algebra",
          steps: ['(x - 1)(x² - 5x + 6) = 0', '(x - 1)(x - 2)(x - 3) = 0', 'x = 1, x = 2, x = 3'],
          solution: 'x = 1, x = 2, x = 3'
        }
      ]
    },
    derivatives: {
      'Beginner': [
        {
          problem: "f(x) = 3x²",
          description: "Find the derivative:",
          difficulty: "Beginner",
          topic: "derivatives"
        }
      ],
      'Intermediate': [
        {
          problem: "f(x) = sin(2x) + cos(x)",
          description: "Find the derivative:",
          difficulty: "Intermediate", 
          topic: "derivatives"
        }
      ],
      'Advanced': [
        {
          problem: "f(x) = e^(x²) · ln(x)",
          description: "Find the derivative using product rule:",
          difficulty: "Advanced",
          topic: "derivatives"
        }
      ]
    },
    integrals: {
      'Beginner': [
        {
          problem: "∫ 2x dx",
          description: "Evaluate the integral:",
          difficulty: "Beginner",
          topic: "integrals"
        }
      ],
      'Intermediate': [
        {
          problem: "∫ x·e^x dx",
          description: "Evaluate using integration by parts:",
          difficulty: "Intermediate",
          topic: "integrals"
        }
      ],
      'Advanced': [
        {
          problem: "∫ sin²(x)·cos³(x) dx",
          description: "Evaluate the trigonometric integral:",
          difficulty: "Advanced",
          topic: "integrals"
        }
      ]
    }
  };

  // Get problems for the topic and difficulty
  const topicProblems = mockProblems[topic] || mockProblems.algebra;
  const difficultyProblems = topicProblems[difficulty] || topicProblems['Beginner'];
    // Select random problem from difficulty level
  const randomProblem = difficultyProblems[Math.floor(Math.random() * difficultyProblems.length)];
  
  // Mock session data
  currentSession = {
    sessionId: 'dev-session-' + Date.now(),
    currentStep: 0,
    totalSteps: 5,
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
  
  console.log('📊 Created current problem:', currentProblem);
  
  // Update the UI with the new problem
  updateProblemDisplay(currentProblem, topic);
  
  // Clear any previous solution log
  clearSolutionLog();
  
  // Show development notice
  showDevelopmentNotice();
}

// Function to initialize difficulty selector
function initializeDifficultySelector() {
  const difficultyButtons = document.querySelectorAll('.difficulty-btn');
  const difficultyDescription = document.getElementById('difficulty-description');
  const newProblemBtn = document.getElementById('new-problem-btn');
  
  // Difficulty descriptions
  const descriptions = {
    'Beginner': '<span class="font-medium">Beginner:</span> Basic equations and simple operations',
    'Intermediate': '<span class="font-medium">Intermediate:</span> Quadratic equations and multi-step problems',
    'Advanced': '<span class="font-medium">Advanced:</span> Complex equations and advanced topics'
  };
  
  // Set initial active state
  setActiveDifficulty('Beginner');
  
  // Add click handlers
  difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const difficulty = btn.dataset.difficulty;
      setActiveDifficulty(difficulty);
      selectedDifficulty = difficulty;
      
      // Update description
      if (difficultyDescription) {
        difficultyDescription.innerHTML = descriptions[difficulty];
      }
    });
  });
  
  // New problem button handler
  if (newProblemBtn) {
    newProblemBtn.addEventListener('click', async () => {
      newProblemBtn.disabled = true;
      newProblemBtn.innerHTML = `
        <svg class="w-4 h-4 inline mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        Loading...
      `;
      
      await initializeNewProblem(selectedTopic, selectedDifficulty);
      
      // Reset button
      newProblemBtn.disabled = false;
      newProblemBtn.innerHTML = `
        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        New Problem
      `;
    });
  }
}

// Function to set active difficulty
function setActiveDifficulty(difficulty) {
  const difficultyButtons = document.querySelectorAll('.difficulty-btn');
  
  difficultyButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.difficulty === difficulty) {
      btn.classList.add('active');
    }
  });
}

// Function to setup event handlers
function setupEventHandlers() {
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');
  const keyboardToggle = document.getElementById('keyboard-toggle');
  const mathKeyboard = document.getElementById('math-keyboard');
  const keyboardKeys = document.querySelectorAll('.keyboard-key');
  
  // Set up send button handler
  if (sendButton) {
    sendButton.addEventListener('click', handleUserInput);
  }
  
  // Set up input field handler
  if (chatInput) {
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        handleUserInput();
      }
    });
  }
  
  // Set up keyboard toggle
  if (keyboardToggle) {
    keyboardToggle.addEventListener('click', function() {
      if (mathKeyboard) {
        mathKeyboard.classList.toggle('hidden');
      }
    });
  }
  
  // Set up math keyboard keys
  keyboardKeys.forEach(key => {
    key.addEventListener('click', function() {
      if (chatInput) {
        chatInput.value += this.textContent;
        chatInput.focus();
      }
    });
  });
}

// Wait for math.js to be loaded before using validation in dev mode
function waitForMathJs() {
  return new Promise(resolve => {
    if (window.math) return resolve();
    const check = () => {
      if (window.math) resolve();
      else setTimeout(check, 30);
    };
    check();
  });
}

// Function to handle user input and validate with backend
async function handleUserInput() {
  const chatInput = document.getElementById('chat-input');
  const userInput = chatInput.value.trim();

  if (!userInput || !currentSession || currentSession.isCompleted) {
    return;
  }

  try {
    // Show processing state
    showProcessingState();

    if (currentSession.isDevelopmentMode) {
      // Wait for math.js to be loaded before validating
      await waitForMathJs();
      handleDevelopmentValidation(userInput);
      return;
    }
    
    // Send step to backend for validation
    const response = await fetch(`${supabase.supabaseUrl}${CONFIG.ENDPOINTS.VALIDATE_STEP}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.supabaseKey}`
      },
      body: JSON.stringify({
        sessionId: currentSession.sessionId,
        userStep: userInput
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const validation = await response.json();
    
    // Update session state
    currentSession.currentStep = validation.currentStep;
    currentSession.isCompleted = validation.isCompleted;
    
    // Add step to solution log
    addStepToLog(userInput, validation.isValid, validation.feedback);
    
    // Clear input
    chatInput.value = '';
    
    // Handle completion
    if (validation.isCompleted) {
      showCompletionMessage(validation.completionMessage);
    }
    
  } catch (error) {
    console.error('Error validating step:', error);
    showErrorMessage('Failed to validate step. Please try again.');
  }
}

// Development mode validation with enhanced logic
function handleDevelopmentValidation(userInput) {
  const chatInput = document.getElementById('chat-input');
  
  // Use enhanced validation logic with current problem data
  let isValid = false;
  let feedback = '';
  
  console.log('🔍 currentProblem in handleDevelopmentValidation:', JSON.stringify(currentProblem)); // LOG AGGIUNTO

  if (currentProblem && currentSession) {
    // Get problem data from current session
    const problemSteps = currentProblem.steps || [];
    const currentStepIndex = currentSession.currentStep || 0;
    const originalEquation = currentProblem.problem || currentProblem.equation;
    
    console.log('🧪 Development validation:', {
      userInput,
      problemSteps,
      currentStepIndex,
      originalEquation
    });
    
    // Use the enhanced validation logic that supports:
    // - Original equation acceptance
    // - Superscript/caret equivalency  
    // - Step skipping
    // - Mathematical equivalency
    const validation = validateMathStepLocal(userInput, problemSteps, currentStepIndex, originalEquation);
    
    isValid = validation.isValid;
    feedback = validation.feedback || (isValid ? 'Good step! Continue with the solution.' : 'This step doesn\'t seem correct. Try again.');
    
    // Update session based on validation result
    if (isValid) {
      currentSession.currentStep = validation.nextStepIndex;
      if (currentSession.currentStep >= problemSteps.length) {
        currentSession.isCompleted = true;
      }
    }
  } else {
    // Fallback validation if no problem data
    isValid = userInput.length > 2;
    feedback = isValid ? 'Good step!' : 'Please provide more detail in your solution.';
    
    // Simple session update
    if (isValid && currentSession) {
      currentSession.currentStep++;
      if (currentSession.currentStep >= (currentSession.totalSteps || 3)) {
        currentSession.isCompleted = true;
      }
    }
  }
  
  // Add step to log
  addStepToLog(userInput, isValid, feedback);
  
  // Clear input
  chatInput.value = '';
  
  // Handle completion
  if (currentSession && currentSession.isCompleted) {
    showCompletionMessage('🎉 Congratulations! You completed the problem in development mode. Deploy the backend to get full validation!');
  }
}

// Local validation function that mimics the backend logic for development mode
function validateMathStepLocal(userStep, correctSteps, currentStepIndex, originalEquation) {
  // Use math.js if available (should be loaded in index.html or dynamically)
  let math = window.math || null;

  function splitAndNormalize(eq) {
    const [left, right] = eq.split('=');
    return [left, right].map(side =>
      side
        .replace(/\s+/g, '')
        .replace(/\*/g, '')
        .replace(/\+-/g, '-')
        .replace(/-\+/g, '-')
        .replace(/([a-zA-Z])([0-9])/g, '$1*$2')
        .replace(/([0-9])([a-zA-Z])/g, '$1*$2')
        .toLowerCase()
    );
  }

  function evalSimple(expr) {
    try {
      if (/^[0-9xX+\-*/.]+$/.test(expr)) {
        return eval(expr.replace(/x/g, '1').replace(/X/g, '1'));
      }
    } catch {}
    return expr;
  }

  function areEquivalent(a, b) {
    if (math) {
      try {
        // Try to simplify both sides
        const sa = math.simplify(a).toString();
        const sb = math.simplify(b).toString();
        // Accept also if numeric value is the same
        if (sa === sb) return true;
        if (!isNaN(Number(sa)) && !isNaN(Number(sb)) && Number(sa) === Number(sb)) return true;
      } catch {}
    }
    // fallback: evalSimple
    return evalSimple(a) === evalSimple(b);
  }

  const normalizedUserStep = userStep.replace(/\s+/g, '');
  let debugLog = `🔍 User: "${userStep}" => "${normalizedUserStep}"\n`;

  for (let i = currentStepIndex; i < correctSteps.length; i++) {
    const step = correctSteps[i];
    const [ul, ur] = splitAndNormalize(userStep);
    const [cl, cr] = splitAndNormalize(step);
    debugLog += `🔍 Step[${i}]: user [${ul}]=[${ur}] vs correct [${cl}]=[${cr}]\n`;
    // Direct match
    if (ul === cl && ur === cr) {
      return { isValid: true, nextStepIndex: i + 1, feedback: 'Step accepted!\n' + debugLog };
    }
    // Accept swapped sides
    if (ul === cr && ur === cl) {
      return { isValid: true, nextStepIndex: i + 1, feedback: 'Step accepted (swapped sides)!\n' + debugLog };
    }
    // Accept if both sides are mathematically equivalent (math.js or fallback)
    if (areEquivalent(ul, cl) && areEquivalent(ur, cr)) {
      return { isValid: true, nextStepIndex: i + 1, feedback: 'Step accepted (math equivalent)!\n' + debugLog };
    }
    if (areEquivalent(ul, cr) && areEquivalent(ur, cl)) {
      return { isValid: true, nextStepIndex: i + 1, feedback: 'Step accepted (math equivalent, swapped)!\n' + debugLog };
    }
  }
  debugLog += '❌ Nessuna corrispondenza trovata.';
  return {
    isValid: false,
    nextStepIndex: currentStepIndex,
    feedback: 'This step doesn\'t seem correct. Try simplifying the current expression or check your algebra.\n' + debugLog
  };
}
// Utility functions for UI updates
function showLoadingState() {
  // Show loading in the problem description and equation
  const problemDescription = document.getElementById('problem-description');
  const problemEquation = document.getElementById('problem-equation');
  
  if (problemDescription) {
    problemDescription.innerHTML = `
      <div class="flex items-center gap-2 text-gray-500">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
        Loading problem...
      </div>
    `;
  }
  
  if (problemEquation) {
    problemEquation.textContent = '...';
  }
}

function showErrorState(message) {
  const problemDescription = document.getElementById('problem-description');
  const problemEquation = document.getElementById('problem-equation');
  
  if (problemDescription) {
    problemDescription.innerHTML = `
      <div class="flex items-center gap-2 text-red-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        Error loading problem
      </div>
    `;
  }
  
  if (problemEquation) {
    problemEquation.textContent = 'Please try again';
  }
}

function clearSolutionLog() {
  const solutionLog = document.getElementById('solution-log');
  if (solutionLog) {
    solutionLog.innerHTML = `
      <div class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </div>
        <p class="text-gray-500 text-sm">Start entering your solution steps in the right panel.</p>
        <p class="text-gray-400 text-xs mt-1">Each step will appear here for review.</p>
      </div>
    `;
  }
}

function showProcessingState() {
  const sendButton = document.getElementById('send-button');
  if (sendButton) {
    sendButton.disabled = true;
    sendButton.innerHTML = `
      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      Processing...
    `;
  }
}

function addStepToLog(userInput, isValid, feedback) {
  const solutionLog = document.getElementById('solution-log');
  const sendButton = document.getElementById('send-button');
  
  // Reset send button
  if (sendButton) {
    sendButton.disabled = false;
    sendButton.innerHTML = 'Send Step';
  }
  
  // Clear welcome message if it exists
  const welcomeMessage = solutionLog.querySelector('.text-center.py-8');
  if (welcomeMessage) {
    solutionLog.innerHTML = '';
  }
  
  // Create step element
  const stepElement = document.createElement('div');
  stepElement.className = `step-entry p-3 border-l-4 ${isValid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`;
    const statusClass = isValid ? 'text-green-600' : 'text-red-600';
  const statusText = isValid ? 'Step Correct' : 'Incorrect';
  const hintClass = isValid ? 'text-green-600' : 'text-red-600';
  
  stepElement.innerHTML = `
    <div class="flex justify-between items-start">
      <div class="step-content text-[#4a5568] flex-1">${userInput}</div>
      <div class="status text-sm font-medium ${statusClass} ml-2">
        ${statusText}
      </div>
    </div>
    ${feedback ? `<div class="hint text-sm ${hintClass} mt-1">${feedback}</div>` : ''}
  `;
  
  solutionLog.appendChild(stepElement);
  
  // Auto-scroll to bottom
  solutionLog.scrollTop = solutionLog.scrollHeight;
}

function showCompletionMessage(message) {
  const solutionLog = document.getElementById('solution-log');
  
  const completionElement = document.createElement('div');
  completionElement.className = 'completion-message p-4 border-l-4 border-blue-500 bg-blue-50 mt-4';
  completionElement.innerHTML = `
    <div class="text-blue-700 font-medium mb-3">Exercise Complete!</div>
    <button onclick="initializeNewProblem('${selectedTopic}')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
      Try Another Problem
    </button>
  `;
  
  solutionLog.appendChild(completionElement);
  solutionLog.scrollTop = solutionLog.scrollHeight;
}

function showErrorMessage(message) {
  const solutionLog = document.getElementById('solution-log');
  
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message p-3 border-l-4 border-red-500 bg-red-50 mt-2';
  errorElement.innerHTML = `
    <div class="text-red-700 text-sm">${message}</div>
  `;
  
  solutionLog.appendChild(errorElement);
  solutionLog.scrollTop = solutionLog.scrollHeight;
}

function showDevelopmentNotice() {
  const solutionLog = document.getElementById('solution-log');
  
  const noticeElement = document.createElement('div');
  noticeElement.className = 'dev-notice p-3 border-l-4 border-blue-500 bg-blue-50 mb-4';
  noticeElement.innerHTML = `
    <div class="text-blue-700 text-sm">
      <strong>🚧 Development Mode</strong><br>
      Backend validation is not available. Using mock validation for testing.
      <br>Deploy Supabase Edge Functions for full functionality.
    </div>
  `;
  
  solutionLog.appendChild(noticeElement);
}

// Function to update problem display
function updateProblemDisplay(problem, topic) {
  console.log('🎯 Updating problem display:', problem, 'Topic:', topic);
  
  // Update problem description and equation with dynamic IDs
  const problemDescription = document.getElementById('problem-description');
  const problemEquation = document.getElementById('problem-equation');
  
  console.log('Found elements:', { problemDescription, problemEquation });
  
  if (problemDescription) {
    problemDescription.textContent = problem.description;
    console.log('Updated description:', problem.description);
  } else {
    console.error('❌ Could not find problem-description element');
  }
  
  if (problemEquation) {
    problemEquation.textContent = problem.problem;
    console.log('Updated equation:', problem.problem);
  } else {
    console.error('❌ Could not find problem-equation element');
  }
  
  // Update topic badge with dynamic ID
  const topicBadge = document.getElementById('topic-badge');
  if (topicBadge) {
    const topicColors = {
      algebra: 'bg-indigo-100 text-indigo-700',
      derivatives: 'bg-purple-100 text-purple-700', 
      geometry: 'bg-emerald-100 text-emerald-700',
      statistics: 'bg-orange-100 text-orange-700',
      integrals: 'bg-blue-100 text-blue-700'
    };
    
    topicBadge.className = `px-2 py-1 rounded-full text-xs font-medium ${topicColors[topic] || topicColors.algebra}`;
    topicBadge.textContent = topic.charAt(0).toUpperCase() + topic.slice(1);
  }
  
  // Update difficulty badge with dynamic ID  
  const difficultyBadge = document.getElementById('difficulty-badge');
  if (difficultyBadge) {
    const difficultyColors = {
      'Beginner': 'bg-green-100 text-green-700',
      'Intermediate': 'bg-yellow-100 text-yellow-700',
      'Advanced': 'bg-red-100 text-red-700'
    };
    
    difficultyBadge.className = `px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[problem.difficulty]}`;
    difficultyBadge.textContent = problem.difficulty;
  }
}

// Make initializeNewProblem globally accessible for "Try Another Problem" button
window.initializeNewProblem = initializeNewProblem;

// Function to update user info in the navbar
async function updateUserInfo() {
  try {
    // Check authentication status
    const { data: { session } } = await supabase.auth.getSession();
    const legacyUser = localStorage.getItem('user_logged_in');
    
    // Get user info if logged in
    if (session || legacyUser) {
      const userEmail = session ? session.user.email : localStorage.getItem('user_email');
      const userNicknameElement = document.getElementById('user-nickname');
      const userInitialElement = document.getElementById('user-initial');
      
      if (userNicknameElement && userEmail) {
        // Generate nickname from email (part before @)
        const nickname = userEmail.split('@')[0];
        userNicknameElement.textContent = nickname;
      }
      
      if (userInitialElement && userEmail) {
        // Generate initial from email or nickname
        const nickname = userEmail.split('@')[0];
        userInitialElement.textContent = nickname.charAt(0).toUpperCase();
      }
      
      // Set up logout button
      const logoutButton = document.getElementById('logout-button');
      if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('Error signing out:', error.message);
          } else {
            // Clear legacy storage
            localStorage.removeItem('user_logged_in');
            localStorage.removeItem('user_email');
            window.location.href = '/index.html';
          }
        });
      }
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/index.html';
    }  } catch (error) {
    console.error('Error updating user info:', error);
    window.location.href = '/index.html';
  }
}
