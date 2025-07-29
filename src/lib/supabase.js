import {createClient} from '@supabase/supabase-js';

// Log initialization attempt
console.log('🔄 Initializing Supabase client...');

// Hard-coded values for immediate testing - REPLACE with env vars in production
const SUPABASE_URL = 'https://oeccgchvvewljcrfayrg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lY2NnY2h2dmV3bGpjcmZheXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NzIyNjEsImV4cCI6MjA2ODU0ODI2MX0.A_OyJgFUudjNSrhHcfD6oE6iNtnQnwAGFrrmsuqcKIU';

// Validate credentials
if (!SUPABASE_URL) {
  console.error('❌ CRITICAL ERROR: SUPABASE_URL is missing!');
}

if (!SUPABASE_ANON_KEY) {
  console.error('❌ CRITICAL ERROR: SUPABASE_ANON_KEY is missing!');
}

// Create client with error handling
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test connection immediately
console.log('🔍 Testing Supabase connection...');
supabase.auth.getSession()
  .then(({data, error}) => {
    if (error) {
      console.error('❌ Supabase connection test FAILED:', error.message);
    } else {
      console.log('✅ Supabase connection test SUCCESSFUL', {
        hasSession: !!data.session,
        user: data.session?.user?.email || 'No user'
      });
    }
  })
  .catch(err => {
    console.error('❌ Supabase initialization error:', err.message);
  });