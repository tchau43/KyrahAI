// lib/auth.ts
import { supabase } from './supabase';
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
import { generateSecureToken, hashToken } from './crypto';
import { GetMessagesParams, GetMessagesResult, Message } from '@/features/chat/data';

// ============================================
// Anonymous Session Management
// ============================================

/**
 * Start a new anonymous session
 * @param metadata - Optional metadata (language, timezone, user agent, etc.)
 * @returns Session ID, token, and expiration time
 * @throws {AuthError} If session creation fails
 */
export async function startAnonymousSession(
  metadata: AnonymousSessionMetadata = {}
): Promise<AnonymousSessionResult> {
  try {
    // 1. Create session in database
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        is_anonymous: true,
        auth_type: 'anonymous',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        config: {
          retention_days: 1,
          language: metadata.language || 'vi',
          timezone: metadata.timezone || 'Asia/Ho_Chi_Minh',
        },
      })
      .select()
      .single();

    if (sessionError) {
      throw new AuthError(
        'Failed to create anonymous session',
        sessionError.code,
        500
      );
    }

    if (!session) {
      throw new AuthError('Session creation returned no data', 'NO_DATA', 500);
    }

    // 2. Generate secure random token
    const token = generateSecureToken();
    const tokenHash = hashToken(token);

    // 3. Store token hash in database
    const { error: tokenError } = await supabase
      .from('anonymous_session_tokens')
      .insert({
        session_id: session.session_id,
        token_hash: tokenHash,
        expires_at: session.expires_at,
        user_agent: metadata.userAgent || null,
        ip_address: metadata.ipAddress || null,
      });

    if (tokenError) {
      // Cleanup session if token creation fails
      await supabase
        .from('sessions')
        .delete()
        .eq('session_id', session.session_id);

      throw new AuthError(
        'Failed to create session token',
        tokenError.code,
        500
      );
    }

    // 4. Log auth event
    await logAuthEvent(
      'anonymous_start',
      null,
      session.session_id,
      {
        user_agent: metadata.userAgent,
        ip_address: metadata.ipAddress,
      },
      true
    );

    return {
      sessionId: session.session_id,
      token: token, // Return plain token to client (never store plain text)
      expiresAt: session.expires_at,
    };
  } catch (error) {
    console.error('Error starting anonymous session:', error);

    // Log failed attempt
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
 * @param sessionId - The session ID
 * @param token - The plain text token
 * @returns True if valid, false otherwise
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
      .eq('session_id', sessionId);

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
 * @param email - User's email address
 * @param password - User's password (min 6 characters)
 * @param metadata - Optional user metadata
 * @returns Auth result with user and session
 * @throws {AuthError} If signup fails
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

    // Create initial session if user is confirmed
    let kyrahSession: Session | undefined;

    if (data.user && data.session) {
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: data.user.id,
          is_anonymous: false,
          auth_type: 'email',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (!sessionError && session) {
        kyrahSession = session as Session;
      }

      // Log event
      await logAuthEvent(
        'email_signup',
        data.user.id,
        session?.session_id || null,
        metadata as Record<string, unknown>,
        true
      );
    }

    return {
      user: data.user as SupabaseUser,
      session: data.session as any,
      kyrahSession,
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
 * @param email - User's email address
 * @param password - User's password
 * @param metadata - Optional metadata (user agent, IP, etc.)
 * @returns Auth result with user and session
 * @throws {AuthError} If signin fails
 */
export async function signInWithEmail(
  email: string,
  password: string,
  metadata: SignInMetadata = {}
): Promise<AuthResult> {
  try {
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

    // Create new Kyrah session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: data.user.id,
        is_anonymous: false,
        auth_type: 'email',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (sessionError) {
      console.warn('Failed to create Kyrah session:', sessionError);
    }

    // Log event
    await logAuthEvent(
      'email_signin',
      data.user.id,
      session?.session_id || null,
      metadata as Record<string, unknown>,
      true
    );

    return {
      user: data.user as SupabaseUser,
      session: data.session as any,
      kyrahSession: session as Session | undefined,
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
 * @throws {AuthError} If signout fails
 */
export async function signOut(): Promise<void> {
  try {
    const {
      data: { session: authSession },
    } = await supabase.auth.getSession();

    if (authSession?.user) {
      // Soft delete current sessions
      await supabase
        .from('sessions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('user_id', authSession.user.id)
        .is('deleted_at', null);

      // Log event
      await logAuthEvent('signout', authSession.user.id, null, {}, true);
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new AuthError(
        error.message,
        error.status?.toString(),
        error.status
      );
    }
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
 * @param sessionId - The anonymous session ID
 * @param token - The anonymous session token
 * @returns True if successful
 * @throws {InvalidTokenError} If token is invalid
 * @throws {AuthError} If conversion fails
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

export async function getUserSessions(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('session_id')
    .eq('user_id', userId)
    .is('deleted_at', null);
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>data', data);
  if (error) {
    throw new AuthError('Failed to get all sessions', error.code || 'UNKNOWN_ERROR', 500);
  }
  return data.map((session) => session.session_id);
}

export async function getSessionById(sessionId: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single();
  if (error) {
    throw new AuthError('Failed to get session', error.code || 'UNKNOWN_ERROR', 500);
  }
  return data as Session | null;
}

// ============================================
// Messages Retrieval
// ============================================

/**
 * Get messages for a session with pagination
 * @param params - Parameters including sessionId, limit, offset
 * @returns Messages, total count, and hasMore flag
 * @throws {AuthError} If retrieval fails
 */
export async function getSessionMessages(
  params: GetMessagesParams
): Promise<GetMessagesResult> {
  try {
    const {
      sessionId,
      limit = 10,
      offset = 0,
      includeDeleted = false
    } = params;

    // Build query
    let query = supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    // Filter out deleted messages unless explicitly requested
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

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
 * @returns Current session info or null if no active session
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
        .single();

      if (!error && session) {
        return {
          type: 'authenticated',
          user: user as SupabaseUser,
          session: session as Session,
        };
      }
    }

    // Check for anonymous session in localStorage
    if (typeof window === 'undefined') {
      return null; // Server-side, no localStorage
    }

    const anonymousSessionId = localStorage.getItem(
      'kyrah_anonymous_session_id'
    );
    const anonymousToken = localStorage.getItem('kyrah_anonymous_token');

    if (anonymousSessionId && anonymousToken) {
      const isValid = await verifyAnonymousToken(
        anonymousSessionId,
        anonymousToken
      );

      if (isValid) {
        const { data: session, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('session_id', anonymousSessionId)
          .single();

        if (!error && session) {
          return {
            type: 'anonymous',
            session: session as Session,
            token: anonymousToken,
          };
        }
      } else {
        // Invalid or expired - clear localStorage
        localStorage.removeItem('kyrah_anonymous_session_id');
        localStorage.removeItem('kyrah_anonymous_token');
      }
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
 * @param preferences - Preferences to update
 * @returns Updated preferences
 * @throws {AuthError} If not authenticated or update fails
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
 * Get user preferences
 * @returns User preferences or null if not authenticated
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

    return data as UserPreferences | null;
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
 * @param eventType - Type of auth event
 * @param userId - User ID (null for anonymous events)
 * @param sessionId - Session ID
 * @param metadata - Additional metadata
 * @param success - Whether the event succeeded
 * @param errorMessage - Error message if failed
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
 * @param email - Email to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a password meets minimum requirements
 * @param password - Password to validate
 * @returns Object with valid flag and error message
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
