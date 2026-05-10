import { createClient } from '@supabase/supabase-js'

// We grab our secret keys from the .env file using import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// We initialize the Supabase client. This is the "bridge" that lets our app talk to our database.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
