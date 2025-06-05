import './style.css';
import { supabase } from './supabaseClient.js';

// Function to setup click handlers
function setupClickHandlers() {
  console.log('Setting up click handlers...');
  
  // Set up navigation to math questions
  const practiceButtons = document.querySelectorAll('.practice-button');
  console.log('Found practice buttons:', practiceButtons.length);
  practiceButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Practice button clicked');
      window.location.href = '/math-question.html';
    });
  });
  
  // Set up exercise card clicks with topic selection
  const exerciseCards = document.querySelectorAll('.exercise-card');
  console.log('Found exercise cards:', exerciseCards.length);
  exerciseCards.forEach((card, index) => {
    console.log(`Setting up card ${index}:`, card.getAttribute('data-topic'));
    card.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const topic = card.getAttribute('data-topic');
      console.log('Exercise card clicked, topic:', topic);
      
      // Store the selected topic in sessionStorage for the question page
      sessionStorage.setItem('selectedTopic', topic);
      console.log('Stored topic in sessionStorage:', sessionStorage.getItem('selectedTopic'));
      
      // Add visual feedback
      card.style.transform = 'scale(0.95)';
      setTimeout(() => {
        window.location.href = '/math-question.html';
      }, 100);
    });
    
    // Also add click handlers to the buttons inside the cards
    const button = card.querySelector('button');
    if (button) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const topic = card.getAttribute('data-topic');
        console.log('Card button clicked, topic:', topic);
        sessionStorage.setItem('selectedTopic', topic);
        window.location.href = '/math-question.html';
      });
    }
  });
}

// Check authentication on load
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOMContentLoaded fired');
  
  // Always setup click handlers first
  setupClickHandlers();
  
  // Evita di controllare nuovamente l'autenticazione se siamo appena arrivati dal login
  if (sessionStorage.getItem('redirecting') === 'true') {
    console.log('Skipping auth check after redirect');
    sessionStorage.removeItem('redirecting');
    return;
  }

  try {
    // Check authentication status
    const { data: { session } } = await supabase.auth.getSession();
    const legacyUser = localStorage.getItem('user_logged_in');
    
    // Get user info if logged in
    if (session || legacyUser) {
      console.log('User is logged in:', session ? session.user.email : localStorage.getItem('user_email'));
        // Update UI with user information
      const userEmail = session ? session.user.email : localStorage.getItem('user_email');
      const userNicknameElement = document.getElementById('user-nickname');
      const userInitialElement = document.getElementById('user-initial');
      
      if (userNicknameElement) {
        // Generate nickname from email (part before @)
        const nickname = userEmail ? userEmail.split('@')[0] : 'User';
        userNicknameElement.textContent = nickname;
      }
      
      if (userInitialElement) {
        // Generate initial from email or nickname
        const nickname = userEmail ? userEmail.split('@')[0] : 'User';
        userInitialElement.textContent = nickname.charAt(0).toUpperCase();
      }
      
      // Show user's progress if available
      if (session && session.user.id) {
        fetchUserProgress(session.user.id);
      }
      
      // Set up logout button
      const logoutButton = document.getElementById('logout-button');
      if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('Error signing out:', error.message);
          } else {
            localStorage.removeItem('user_logged_in');
            localStorage.removeItem('user_email');
            window.location.href = '/index.html';
          }
        });
      }
      
    } else {
      // Redirect to login page if not authenticated
      console.log('No user session found, redirecting to login');
      window.location.href = '/index.html';
    }
  } catch (error) {
    console.error('Error during authentication check:', error);
    // Still allow access but setup handlers
    setupClickHandlers();
  }
});

// Also setup handlers after a short delay in case DOMContentLoaded already fired
setTimeout(() => {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('Setting up handlers via timeout fallback');
    setupClickHandlers();
  }
}, 500);

// Function to fetch and display user progress
async function fetchUserProgress(userId) {
  try {
    // You can implement this to fetch user progress from Supabase
    // For now, we'll just show some placeholder data with 2025 design
    
    const progressElement = document.getElementById('user-progress');
    if (progressElement) {
      progressElement.innerHTML = `
        <div class="relative pt-1 mb-4">
          <div class="w-full bg-indigo-100 rounded-full h-4 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[45%] rounded-full transition-all duration-1000 shadow-inner"></div>
          </div>
          <div class="flex justify-between items-center mt-2">
            <span class="text-xs font-semibold inline-block text-indigo-600">Course progress</span>
            <span class="text-xs font-semibold inline-block text-indigo-600">45%</span>
          </div>
        </div>
        <div class="text-sm text-gray-600 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>3 modules completed this week</span>
        </div>
      `;
    }
    
    // Update recent activity with modern 2025 style
    const recentActivityElement = document.getElementById('recent-activity');
    if (recentActivityElement) {
      recentActivityElement.innerHTML = `
        <div class="space-y-3">
          <div class="p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors">
            <div class="flex justify-between items-start">
              <p class="font-medium text-gray-800">Completed Algebra Quiz</p>
              <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">A+</span>
            </div>
            <div class="flex items-center gap-1 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-gray-500">June 4, 2025</p>
            </div>
          </div>
          <div class="p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors">
            <div class="flex justify-between items-start">
              <p class="font-medium text-gray-800">Started Calculus Module</p>
              <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">New</span>
            </div>
            <div class="flex items-center gap-1 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-gray-500">June 2, 2025</p>
            </div>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error fetching user progress:', error.message);
  }
}
