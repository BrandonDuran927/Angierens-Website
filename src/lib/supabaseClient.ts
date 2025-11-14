// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Get env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Add diagnostic logging
console.log('Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl)
  console.error(
    'VITE_SUPABASE_ANON_KEY:',
    supabaseAnonKey ? '[REDACTED]' : 'undefined',
  )
}

// Create a single shared client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

console.log('Supabase client created, URL:', supabaseUrl)
