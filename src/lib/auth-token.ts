import { supabase } from './supabase';

export async function getAuthToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.access_token) {
      return session.access_token;
    }

    const anonymousToken = sessionStorage.getItem('kyrah_anonymous_token');
    return anonymousToken || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}
