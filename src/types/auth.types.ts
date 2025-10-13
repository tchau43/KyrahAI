// types/auth.types.ts

export type AuthType = 'anonymous' | 'email';

export interface Session {
  session_id: string;
  user_id: string | null;
  is_anonymous: boolean;
  auth_type: AuthType;
  created_at: string;
  expires_at: string;
  last_activity_at: string;
  deleted_at: string | null;
  config: SessionConfig;
  metadata: Record<string, unknown>;
}

export interface SessionConfig {
  retention_days: number;
  language: string;
  timezone: string;
}

export interface AnonymousSessionToken {
  token_id: string;
  session_id: string;
  token_hash: string;
  created_at: string;
  last_used_at: string;
  expires_at: string;
  user_agent: string | null;
  ip_address: string | null;
}

export interface UserPreferences {
  user_id: string;
  retention_days: number;
  language: string;
  timezone: string;
  allow_analytics: boolean;
  allow_improvement_research: boolean;
  notifications: NotificationPreferences;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  weekly_check_in: boolean;
  resource_updates: boolean;
}

export interface AuthEvent {
  event_id: string;
  event_type: AuthEventType;
  user_id: string | null;
  session_id: string | null;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  success: boolean;
  error_message: string | null;
}

export type AuthEventType =
  | 'anonymous_start'
  | 'email_signup'
  | 'email_signin'
  | 'signout'
  | 'anonymous_to_authenticated';

// ============================================
// Supabase Auth Types
// ============================================

export interface SupabaseUser {
  id: string;
  email?: string;
  email_confirmed_at?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  role?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: SupabaseUser;
}

// ============================================
// Function Return Types
// ============================================

export interface AnonymousSessionResult {
  sessionId: string;
  token: string;
  expiresAt: string;
}

export interface AuthResult {
  user: SupabaseUser;
  session: SupabaseSession | null;
  kyrahSession?: Session;
}

export interface CurrentSession {
  type: 'authenticated' | 'anonymous';
  user?: SupabaseUser;
  session: Session;
  token?: string;
}

// ============================================
// Function Parameter Types
// ============================================

export interface AnonymousSessionMetadata {
  language?: string;
  timezone?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface SignUpMetadata {
  displayName?: string;
  language?: string;
  timezone?: string;
  userAgent?: string;
  ipAddress?: string;
  [key: string]: unknown;
}

export interface SignInMetadata {
  userAgent?: string;
  ipAddress?: string;
}

export interface UserPreferencesUpdate {
  retention_days?: number;
  language?: string;
  timezone?: string;
  allow_analytics?: boolean;
  allow_improvement_research?: boolean;
  notifications?: Partial<NotificationPreferences>;
}

// ============================================
// Error Types
// ============================================

export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class InvalidTokenError extends AuthError {
  constructor(message: string = 'Invalid or expired token') {
    super(message, 'INVALID_TOKEN', 401);
    this.name = 'InvalidTokenError';
  }
}

export class UserNotFoundError extends AuthError {
  constructor(message: string = 'User not found') {
    super(message, 'USER_NOT_FOUND', 404);
    this.name = 'UserNotFoundError';
  }
}

export class SessionExpiredError extends AuthError {
  constructor(message: string = 'Session has expired') {
    super(message, 'SESSION_EXPIRED', 401);
    this.name = 'SessionExpiredError';
  }
}

// ============================================
// Utility Types
// ============================================

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;
