import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Create a Supabase client with user authentication context
 * This allows server-side operations to run with the user's permissions
 */
export function createAuthenticatedSupabaseClient(authToken: string) {
  return createClient(supabaseUrl || '', supabaseAnonKey || '', {
    global: {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
