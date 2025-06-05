import './style.css';
import { setupHomepage } from './homepage';
import { supabase } from './supabaseClient';

// Initialize the homepage as soon as possible
document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app');
  if (appElement) {
    setupHomepage(appElement);
  }
});
