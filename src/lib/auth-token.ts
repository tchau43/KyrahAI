import { supabase } from './supabase';

export async function getAuthToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      const token = session.access_token;
      const isJwt = typeof token === 'string' && token.split('.').length === 3;
      return isJwt ? token : null;
    }

    // Do NOT return custom anonymous token here; avoid sending non-JWT as Authorization
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}
