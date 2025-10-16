import { createClient } from '../utils/supabase/client';

export async function getAuthToken(): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      const token = session.access_token;
      const isJwt = typeof token === 'string' && token.split('.').length === 3;
      return isJwt ? token : null;
    }

    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}
