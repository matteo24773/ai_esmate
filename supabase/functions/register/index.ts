// supabase/functions/register/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

// Crea un client Supabase per accedere al database
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://eeqakxjohdqpfihgkfrg.supabase.co';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Supporta solo richieste POST
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    // Estrai email, password e nickname dal body
    const { email, password, nickname } = await req.json();

    // Validazione dei campi richiesti
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Controlla se l'email è già registrata nella tabella users
    const { data: existingUsers } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Crea utente in auth.users direttamente (con flag email_confirmed_at per bypassare email)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Imposta subito come confermato
    });

    if (authError) {
      throw authError;
    }

    // Se la creazione dell'utente auth è riuscita, inserisci nella tabella users
    if (authUser && authUser.user) {
      const { error: usersError } = await supabase
        .from('users')
        .insert([{
          id: authUser.user.id,
          email: email,
          nickname: nickname || email.split('@')[0] // Default nickname se non fornito
        }]);

      if (usersError) {
        throw usersError;
      }
    }

    return new Response(
      JSON.stringify({ success: true, user: { email, nickname } }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error in register function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Registration failed' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
