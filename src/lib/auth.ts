// src/lib/auth.ts
import { createClient } from '../utils/supabase/client';

const supabase = createClient();
import type {
  AnonymousSessionResult,
  AnonymousSessionMetadata,
  AuthResult,
  SignUpMetadata,
  SignInMetadata,
  CurrentSession,
  UserPreferences,
  UserPreferencesUpdate,
  AuthEventType,
  Session,
  SupabaseUser,
} from '../types/auth.types';
import { AuthError, InvalidTokenError } from '../types/auth.types';
import { generateUuid, hashToken } from './crypto';
import { GetMessagesParams, GetMessagesResult, Message } from '@/features/chat/data';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
}

async function generateUniqueSessionId(maxRetries: number = 5): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const candidate = generateUuid();
    const { data } = await supabase
      .from('sessions')
      .select('session_id')
      .eq('session_id', candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  throw new AuthError('Failed to generate unique session id', 'UUID_COLLISION', 500);
}

export async function createTempSession(): Promise<{ session_id: string }> {
  const sessionId = await generateUniqueSessionId();
  if (isBrowser()) {
    sessionStorage.setItem('kyrah_temp_session_id', sessionId);
  }
  return { session_id: sessionId };
}

export function getTempSessionId(): string | null {
  if (!isBrowser()) return null;
  const id = sessionStorage.getItem('kyrah_temp_session_id');
  return id || null;
}

export function clearTempSession(): void {
  if (isBrowser()) {
    sessionStorage.removeItem('kyrah_temp_session_id');
  }
}

export function clearAllSessionData(): void {
  if (!isBrowser()) return;
  try { sessionStorage.removeItem('kyrah_temp_session_id'); } catch { }
  try { sessionStorage.removeItem('kyrah_anonymous_token'); } catch { }
  try { localStorage.removeItem('kyrah_anonymous_session_id'); } catch { }
}


export async function sendMessage(sessionId: string, content: string): Promise<Message> {
  const { data: message, error: msgError } = await supabase
    .from('messages')
    .insert({
      session_id: sessionId,
      role: 'user',
      content: content,
    })
    .select()
    .single();
  if (msgError || !message) {
    throw new AuthError('Failed to create message', msgError?.code || 'UNKNOWN_ERROR', 500);
  }
  return message as Message;
}

// ============================================
// Anonymous Session Management
// ============================================

/**
 * Start a new anonymous session
 */
export async function startAnonymousSession(
  _metadata: AnonymousSessionMetadata = {}
): Promise<AnonymousSessionResult> {
  try {
    // Create a client-only temporary session id; defer DB writes until first message
    const temp = await createTempSession();

    // Generate a UUID token_id (not a hash) to be stored and validated 1:1 with session_id
    const tokenId = generateUuid();
    if (isBrowser()) {
      sessionStorage.setItem('kyrah_anonymous_token', tokenId);
    }

    return {
      sessionId: temp.session_id,
      token: tokenId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    console.error('Error starting anonymous session:', error);
    await logAuthEvent(
      'anonymous_start',
      null,
      null,
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error instanceof AuthError
      ? error
      : new AuthError('Failed to start anonymous session');
  }
}

/**
 * Verify an anonymous session token
 */
export async function verifyAnonymousToken(
  sessionId: string,
  token: string
): Promise<boolean> {
  try {
    const tokenHash = hashToken(token);

    const { data, error } = await supabase
      .from('anonymous_session_tokens')
      .select('session_id, expires_at')
      .eq('session_id', sessionId)
      .eq('token_hash', tokenHash)
      .single();

    if (error || !data) {
      return false;
    }

    // Check expiration
    if (new Date(data.expires_at) < new Date()) {
      return false;
    }

    // Update last_used_at
    await supabase
      .from('anonymous_session_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('session_id', sessionId)
      .eq('token_hash', tokenHash);

    return true;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
}

// ============================================
// Email/Password Authentication
// ============================================

/**
 * Sign up a new user with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata: SignUpMetadata = {}
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: metadata.displayName || null,
          language: metadata.language || 'vi',
          timezone: metadata.timezone || 'Asia/Ho_Chi_Minh',
          timezone_offset: metadata.timezone ? getTimezoneOffset(metadata.timezone) : 'UTC+0',
          ...metadata,
        },
      },
    });

    if (error) {
      throw new AuthError(
        error.message,
        error.status?.toString(),
        error.status
      );
    }

    if (!data.user) {
      throw new AuthError('Signup returned no user', 'NO_USER', 500);
    }

    if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
      throw new AuthError(
        'An account with this email already exists.',
        'EMAIL_EXISTS',
        409
      );
    }

    if (data.user && data.session) {
      await logAuthEvent(
        'email_signup',
        data.user.id,
        null,
        metadata as Record<string, unknown>,
        true
      );
    }

    return {
      user: data.user,
      session: data.session,
      kyrahSession: undefined,
    };
  } catch (error) {
    console.error('Error signing up:', error);
    await logAuthEvent(
      'email_signup',
      null,
      null,
      metadata as Record<string, unknown>,
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );

    throw error instanceof AuthError
      ? error
      : new AuthError('Failed to sign up');
  }
}

/**
 * Sign in an existing user with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string,
  metadata: SignInMetadata = {}
): Promise<AuthResult> {
  try {
    clearAllSessionData();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AuthError(
        error.message,
        error.status?.toString(),
        error.status
      );
    }

    if (!data.user || !data.session) {
      throw new AuthError('Signin returned no user or session', 'NO_DATA', 500);
    }

    // Do not create Kyrah session here; defer until first message
    // A new temp session will be created by AuthContext.handleSignIn
    const kyrahSession = undefined;

    // Log event without session id
    await logAuthEvent(
      'email_signin',
      data.user.id,
      null,
      metadata as Record<string, unknown>,
      true
    );

    return {
      user: data.user,
      session: data.session,
      kyrahSession,
    };
  } catch (error) {
    console.error('Error signing in:', error);
    await logAuthEvent(
      'email_signin',
      null,
      null,
      metadata as Record<string, unknown>,
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );

    throw error instanceof AuthError
      ? error
      : new AuthError('Failed to sign in');
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Log event
      await logAuthEvent('signout', user.id, null, {}, true);
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new AuthError(
        error.message,
        error.status?.toString(),
        error.status
      );
    }

    clearAllSessionData();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error instanceof AuthError
      ? error
      : new AuthError('Failed to sign out');
  }
}

// ============================================
// Session Conversion
// ============================================

/**
 * Convert an anonymous session to an authenticated session
 */
export async function convertAnonymousToAuthenticated(
  sessionId: string,
  token: string
): Promise<boolean> {
  try {
    // Verify token
    const isValid = await verifyAnonymousToken(sessionId, token);
    if (!isValid) {
      throw new InvalidTokenError('Invalid anonymous session token');
    }

    // Get current authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new AuthError('No authenticated user found', 'NO_USER', 401);
    }

    // Convert the session using stored procedure
    const { data, error } = await supabase.rpc(
      'convert_anonymous_to_authenticated',
      {
        p_session_id: sessionId,
        p_user_id: user.id,
      }
    );

    if (error) {
      throw new AuthError(
        'Failed to convert session',
        error.code,
        error.code === 'PGRST116' ? 404 : 500
      );
    }

    // Log event
    await logAuthEvent(
      'anonymous_to_authenticated',
      user.id,
      sessionId,
      {},
      true
    );

    return data as boolean;
  } catch (error) {
    console.error('Error converting session:', error);
    throw error instanceof AuthError
      ? error
      : new AuthError('Failed to convert session');
  }
}

// ============================================
// Session Retrieval
// ============================================

export async function getUserSessions(userId: string): Promise<Session[]> {
  if (!userId) {
    return [];
  }
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('last_activity_at', { ascending: false })
    .gt('expires_at', new Date().toISOString());


  if (error) {
    throw new AuthError('Failed to get all sessions', error.code || 'UNKNOWN_ERROR', 500);
  }
  return data || [];
}

// ============================================
// Messages Retrieval
// ============================================

/**
 * Get messages for a session with pagination
 */
export async function getSessionMessages(
  params: GetMessagesParams
): Promise<GetMessagesResult> {
  try {
    const {
      sessionId,
      limit = 10,
      offset = 0,
    } = params;

    // Build query
    let query = supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('session_id', sessionId)
      .is('deleted_at', null) // Only fetch non-deleted messages
      .order('timestamp', { ascending: true });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new AuthError(
        'Failed to get session messages',
        error.code,
        500
      );
    }

    const total = count || 0;
    const messages = (data || []) as Message[];
    const hasMore = offset + messages.length < total;

    return {
      messages,
      total,
      hasMore,
    };
  } catch (error) {
    console.error('Error getting session messages:', error);
    throw error instanceof AuthError
      ? error
      : new AuthError('Failed to get session messages');
  }
}

/**
 * Get the current user's session (authenticated or anonymous)
 */
export async function getCurrentSession(): Promise<CurrentSession | null> {
  try {
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: session, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('last_activity_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && session) {
        return {
          type: 'authenticated',
          user: user,
          session: session as Session,
        };
      }

      return {
        type: 'authenticated',
        user: user,
        session: null,
      };
    }

    // Fallback: check for temp session id in sessionStorage (pre-persist)
    if (!isBrowser()) {
      return null;
    }
    const tempId = getTempSessionId();
    if (tempId) {
      return {
        type: 'anonymous',
        session: {
          session_id: tempId,
          user_id: null,
          is_anonymous: true,
          auth_type: 'anonymous',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          last_activity_at: new Date().toISOString(),
          deleted_at: null,
          config: { retention_days: 1, language: 'vi', timezone: 'UTC', timezone_offset: 'UTC+0' },
          metadata: {},
          title: '',
        } as Session,
        token: sessionStorage.getItem('kyrah_anonymous_token') || undefined,
      } as CurrentSession;
    }

    return null;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
}

// ============================================
// User Preferences Management
// ============================================

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  preferences: UserPreferencesUpdate
): Promise<UserPreferences> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new AuthError('Not authenticated', 'NOT_AUTHENTICATED', 401);
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new AuthError(
        'Failed to update preferences',
        error.code,
        error.code === 'PGRST116' ? 404 : 500
      );
    }

    return data as UserPreferences;
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error instanceof AuthError
      ? error
      : new AuthError('Failed to update preferences');
  }
}

/**
 * Update user display name
 */
export async function updateUserDisplayName(displayName: string): Promise<SupabaseUser> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new AuthError('Not authenticated', 'NOT_AUTHENTICATED', 401);
    }

    // Update user metadata in Supabase Auth
    const { data, error } = await supabase.auth.updateUser({
      data: {
        display_name: displayName,
      },
    });

    if (error) {
      throw new AuthError(
        'Failed to update display name',
        error.status?.toString(),
        error.status
      );
    }

    if (!data.user) {
      throw new AuthError('Update returned no user', 'NO_USER', 500);
    }

    return data.user;
  } catch (error) {
    console.error('Error updating display name:', error);
    throw error instanceof AuthError
      ? error
      : new AuthError('Failed to update display name');
  }
}

/**
 * Get user preferences
 */
export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // PGRST116 = no rows found (user has no preferences yet)
    if (error && error.code !== 'PGRST116') {
      throw new AuthError('Failed to get preferences', error.code, 500);
    }

    return data;
  } catch (error) {
    console.error('Error getting preferences:', error);
    return null;
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Log an authentication event
 */
async function logAuthEvent(
  eventType: AuthEventType,
  userId: string | null,
  sessionId: string | null,
  metadata: Record<string, unknown>,
  success: boolean,
  errorMessage: string | null = null
): Promise<void> {
  try {
    await supabase.from('auth_events').insert({
      event_type: eventType,
      user_id: userId,
      session_id: sessionId,
      ip_address: metadata.ipAddress as string | null,
      user_agent: metadata.userAgent as string | null,
      metadata: metadata,
      success: success,
      error_message: errorMessage,
    });
  } catch (error) {
    console.error('Error logging auth event:', error);
    // Don't throw - logging failure shouldn't break auth flow
  }
}

/**
 * Check if a string is a valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a password meets minimum requirements
 */
export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }
  return { valid: true };
}

/**
 * Convert timezone to UTC offset format (e.g., "UTC+7", "UTC-5")
 */
export function getTimezoneOffset(timezone: string): string {
  try {
    if (timezone === 'auto') {
      // Use browser's detected timezone
      const now = new Date();
      const offset = -now.getTimezoneOffset() / 60; // Convert minutes to hours
      return offset >= 0 ? `UTC+${offset}` : `UTC${offset}`;
    }

    // Create a date in the specified timezone
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetTime = new Date(utcTime + (new Date().getTimezoneOffset() * 60000));

    // Get the offset for the specific timezone
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'longOffset'
    });

    const parts = formatter.formatToParts(targetTime);
    const offsetPart = parts.find(part => part.type === 'timeZoneName');

    if (offsetPart && offsetPart.value) {
      // Convert from "GMT+07:00" format to "UTC+7" format
      const offsetMatch = offsetPart.value.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
      if (offsetMatch) {
        const sign = offsetMatch[1];
        const hours = parseInt(offsetMatch[2]);
        return `UTC${sign}${hours}`;
      }
    }

    // Fallback: calculate offset manually
    const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
    const localDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const offset = (localDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);

    return offset >= 0 ? `UTC+${Math.round(offset)}` : `UTC${Math.round(offset)}`;
  } catch (error) {
    console.error('Error calculating timezone offset:', error);
    // Fallback to UTC+0
    return 'UTC+0';
  }
}
