// lib/auth.ts
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
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
// Client-side Temp Session Utilities (store only session_id)
// ============================================

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as unknown as { randomUUID: () => string }).randomUUID();
  }
  return uuidv4();
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

const TEMP_SESSION_ID_KEY = 'kyrah_temp_session_id';

export async function createTempSession(): Promise<{ session_id: string }> {
  const sessionId = await generateUniqueSessionId();
  if (isBrowser()) {
    sessionStorage.setItem(TEMP_SESSION_ID_KEY, sessionId);
  }
  return { session_id: sessionId };
}

export function getTempSessionId(): string | null {
  if (!isBrowser()) return null;
  const id = sessionStorage.getItem(TEMP_SESSION_ID_KEY);
  return id || null;
}

export function clearTempSession(): void {
  if (isBrowser()) {
    sessionStorage.removeItem(TEMP_SESSION_ID_KEY);
  }
}

// export async function sendFirstMessage(options: {
//   sessionId: string;
//   content: string;
//   userAgent?: string;
//   ipAddress?: string;
// }): Promise<{ session: Session; message: Message }> {
//   // Get authenticated user from Supabase
//   const {
//     data: { user: authUser },
//   } = await supabase.auth.getUser();
//   const currentUserId = authUser?.id ?? null;
//   // console.log('sendFirstMessage', options);
//   // Check if session already exists
//   const { data: existing } = await supabase
//     .from('sessions')
//     .select('*')
//     .eq('session_id', options.sessionId)
//     .maybeSingle();
//   if (existing) {
//     // If session already exists, just insert the first message
//     const { data: message, error: msgError } = await supabase
//       .from('messages')
//       .insert({
//         session_id: options.sessionId,
//         role: 'user',
//         content: options.content,
//       })
//       .select()
//       .single();
//     if (msgError || !message) {
//       throw new AuthError('Failed to create message', msgError?.code || 'UNKNOWN_ERROR', 500);
//     }
//     // Clear temp session id if it matches
//     if (isBrowser() && getTempSessionId() === options.sessionId) {
//       // Keep for anonymous; clear for authenticated users only
//       if (currentUserId) {
//         clearTempSession();
//       }
//     }
//     return { session: existing as Session, message: message as Message };
//   }

//   const isAnonymous = !currentUserId;
//   const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

//   // Insert into DB using provided session_id
//   const { data: persisted, error: insertError } = await supabase
//     .from('sessions')
//     .insert({
//       session_id: options.sessionId,
//       user_id: currentUserId,
//       is_anonymous: isAnonymous,
//       auth_type: isAnonymous ? 'anonymous' : 'email',
//       expires_at: expiresAt,
//       config: {
//         retention_days: isAnonymous ? 1 : 30,
//         language: 'vi',
//         timezone: 'Asia/Ho_Chi_Minh',
//       },
//     })
//     .select()
//     .single();

//   if (insertError || !persisted) {
//     throw new AuthError('Failed to persist session', insertError?.code || 'UNKNOWN_ERROR', 500);
//   }

//   // For anonymous, create and store a token now
//   if (isAnonymous) {
//     const token = generateSecureToken();
//     const tokenHash = hashToken(token);
//     const { error: tokenError } = await supabase
//       .from('anonymous_session_tokens')
//       .insert({
//         session_id: options.sessionId,
//         token_hash: tokenHash,
//         expires_at: expiresAt,
//         user_agent: options.userAgent || null,
//         ip_address: options.ipAddress || null,
//       });
//     if (tokenError) {
//       throw new AuthError('Failed to create anonymous token', tokenError.code, 500);
//     }
//     if (isBrowser()) {
//       sessionStorage.setItem('kyrah_anonymous_token', token);
//     }
//   }

//   // Insert the first user message
//   const { data: message, error: msgError } = await supabase
//     .from('messages')
//     .insert({
//       session_id: options.sessionId,
//       role: 'user',
//       content: options.content,
//     })
//     .select()
//     .single();
//   console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>message', message);
//   if (msgError || !message) {
//     throw new AuthError('Failed to create message', msgError?.code || 'UNKNOWN_ERROR', 500);
//   }

//   // Clear temp session id after successful persist
//   if (isBrowser() && getTempSessionId() === options.sessionId) {
//     // Keep for anonymous; clear for authenticated users only
//     if (currentUserId) {
//       clearTempSession();
//     }
//   }

//   return { session: persisted as Session, message: message as Message };
// }

// ============================================
// Message Management
// ============================================

/**
 * Send a message to a session
 * @param sessionId - The session ID
 * @param content - The message content
 * @returns The message
 */
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
 * @param metadata - Optional metadata (language, timezone, user agent, etc.)
 * @returns Session ID, token, and expiration time
 * @throws {AuthError} If session creation fails
 */
export async function startAnonymousSession(
  metadata: AnonymousSessionMetadata = {}
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

    // Do not create Kyrah session here; defer until first message
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
      user: data.user as SupabaseUser,
      session: data.session as any,
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

    // Do not create Kyrah session here; defer until first message
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
      user: data.user as SupabaseUser,
      session: data.session as any,
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

export async function getUserSessions(userId: string): Promise<Session[]> {
  if (!userId) {
    return [];
  }
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null);
  if (error) {
    throw new AuthError('Failed to get all sessions', error.code || 'UNKNOWN_ERROR', 500);
  }
  return data;
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
// Session Helpers
// ============================================

/**
 * Reuse an existing empty session for the user if one exists (no messages), otherwise create new.
 */
export async function getOrCreateReusableAuthenticatedSession(userId: string): Promise<Session> {
  // Find an active session for this user that has zero messages
  const { data: existingSessions, error: existingError } = await supabase
    .from('sessions')
    .select('session_id')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (!existingError && existingSessions && existingSessions.length > 0) {
    for (const s of existingSessions as Array<{ session_id: string }>) {
      const { count, error: countError } = await supabase
        .from('messages')
        .select('message_id', { count: 'exact', head: true })
        .eq('session_id', s.session_id)
        .is('deleted_at', null);
      if (!countError && (count ?? 0) === 0) {
        // Reuse this empty session
        const { data } = await supabase
          .from('sessions')
          .select('*')
          .eq('session_id', s.session_id)
          .single();
        return data as Session;
      }
    }
  }

  // Otherwise, create a new session
  const { data: newSession, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      is_anonymous: false,
      auth_type: 'email',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (sessionError || !newSession) {
    throw new AuthError('Failed to create Kyrah session', sessionError?.code || 'UNKNOWN_ERROR', 500);
  }

  return newSession as Session;
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
      includeDeleted = false,
      anonymousToken,
    } = params;

    // Validate access for anonymous sessions: if session is anonymous, verify token
    const { data: sessionRow, error: sessionErr } = await supabase
      .from('sessions')
      .select('session_id, is_anonymous, user_id')
      .eq('session_id', sessionId)
      .single();

    if (sessionErr) {
      // If session not found (404/PGRST116), return empty messages
      // This can happen for temp sessions that haven't been persisted yet
      if (sessionErr.code === 'PGRST116') {
        return {
          messages: [],
          total: 0,
          hasMore: false,
        };
      }
      throw new AuthError(
        'Failed to get session',
        sessionErr.code,
        500
      );
    }

    if (!sessionRow) {
      // Session not found, return empty messages
      return {
        messages: [],
        total: 0,
        hasMore: false,
      };
    }

    if (sessionRow?.is_anonymous) {
      // If anonymous, require a valid token_id (UUID)
      if (!anonymousToken) {
        throw new AuthError('Missing anonymous token', 'NO_ANON_TOKEN', 401);
      }

      // Validate 1:1 relationship: token_id must match session_id
      const { data: tokenRow, error: tokenErr } = await supabase
        .from('anonymous_session_tokens')
        .select('token_id, session_id, expires_at')
        .eq('session_id', sessionId)
        .eq('token_id', anonymousToken)
        .single();

      if (tokenErr || !tokenRow) {
        throw new InvalidTokenError('Invalid anonymous session token - token_id does not match session_id');
      }

      if (new Date(tokenRow.expires_at) < new Date()) {
        throw new InvalidTokenError('Anonymous session token expired');
      }

      // Update last_used_at asynchronously (don't block)
      void supabase
        .from('anonymous_session_tokens')
        .update({ last_used_at: new Date().toISOString() })
        .eq('token_id', anonymousToken)
        .eq('session_id', sessionId);
    }

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
          config: { retention_days: 1, language: 'vi', timezone: 'Asia/Ho_Chi_Minh' },
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
 * Update user display name
 * @param displayName - New display name
 * @returns Updated user
 * @throws {AuthError} If not authenticated or update fails
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

    return data.user as SupabaseUser;
  } catch (error) {
    console.error('Error updating display name:', error);
    throw error instanceof AuthError
      ? error
      : new AuthError('Failed to update display name');
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
