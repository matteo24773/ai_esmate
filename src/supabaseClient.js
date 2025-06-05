// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eeqakxjohdqpfihgkfrg.supabase.co';
// Handle both Vite environment and direct browser usage
const supabaseKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY)
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcWFreGpvaGRxcGZpaGdrZnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTA3NTUsImV4cCI6MjA2NDY4Njc1NX0.hEu3a1-nJDLBU5CVPeKV_f0cAccsGyGDWVdI2_L13IU';

export const supabase = createClient(supabaseUrl, supabaseKey);
