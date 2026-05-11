import { createClient } from '@supabase/supabase-js'

// We grab our secret keys from the .env file using import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * isSupabaseConfigured: A boolean flag that checks if the necessary API keys exist.
 * This is the trigger that tells our App whether to run the "Real" version or the "Static Demo" version.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// We initialize the Supabase client safely. 
// If keys are missing, we pass dummy strings to createClient to prevent it from crashing the entire app on load.
export const supabase = createClient(
    supabaseUrl || "https://placeholder-url.supabase.co", 
    supabaseAnonKey || "placeholder-key"
);
