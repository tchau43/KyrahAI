// contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import * as auth from '../lib/auth'
import type {
  SupabaseUser,
  Session,
  AnonymousSessionResult,
  UserPreferences,
  UserPreferencesUpdate,
} from '../types/auth.types'

// ============================================
// Context Type Definition
// ============================================

interface AuthContextType {
  user: SupabaseUser | null
  session: Session | null
  authType: 'authenticated' | 'anonymous' | null
  loading: boolean

  // Auth methods
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  startAnonymous: () => Promise<AnonymousSessionResult>
  convertToAuthenticated: () => Promise<void>

  // Preferences
  updatePreferences: (prefs: UserPreferencesUpdate) => Promise<UserPreferences>
  getPreferences: () => Promise<UserPreferences | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================
// Hook to use auth context
// ============================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// ============================================
// Auth Provider Component
// ============================================

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [authType, setAuthType] = useState<'authenticated' | 'anonymous' | null>(
    null
  )

  useEffect(() => {
    // Check active session on mount
    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)

      if (event === 'SIGNED_IN' && session) {
        await handleSignIn(session)
      } else if (event === 'SIGNED_OUT') {
        clearSessionState()
      } else if (event === 'USER_UPDATED' && session) {
        setUser(session.user as SupabaseUser)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  async function checkSession(): Promise<void> {
    try {
      const currentSession = await auth.getCurrentSession()

      if (currentSession) {
        if (currentSession.type === 'authenticated') {
          setUser(currentSession.user!)
          setSession(currentSession.session)
          setAuthType('authenticated')
        } else {
          setSession(currentSession.session)
          setAuthType('anonymous')
        }
      }
    } catch (error) {
      console.error('Error checking session:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignIn(authSession: any): Promise<void> {
    setUser(authSession.user as SupabaseUser)
    setAuthType('authenticated')

    // Create Kyrah session
    const { data: kyrahSession } = await supabase
      .from('sessions')
      .insert({
        user_id: authSession.user.id,
        is_anonymous: false,
        auth_type: 'email',
      })
      .select()
      .single()

    if (kyrahSession) {
      setSession(kyrahSession as Session)
    }
  }

  function clearSessionState(): void {
    setUser(null)
    setSession(null)
    setAuthType(null)

    // Clear anonymous session data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kyrah_anonymous_session_id')
      localStorage.removeItem('kyrah_anonymous_token')
    }
  }

  async function startAnonymous(): Promise<AnonymousSessionResult> {
    try {
      const result = await auth.startAnonymousSession()

      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('kyrah_anonymous_session_id', result.sessionId)
        localStorage.setItem('kyrah_anonymous_token', result.token)
      }

      // Fetch the session
      const { data: session } = await supabase
        .from('sessions')
        .select('*')
        .eq('session_id', result.sessionId)
        .single()

      if (session) {
        setSession(session as Session)
        setAuthType('anonymous')
      }

      return result
    } catch (error) {
      console.error('Error starting anonymous session:', error)
      throw error
    }
  }

  async function convertToAuthenticated(): Promise<void> {
    if (authType !== 'anonymous' || !session) {
      throw new Error('Not an anonymous session')
    }

    const token = localStorage.getItem('kyrah_anonymous_token')
    if (!token) {
      throw new Error('No anonymous token found')
    }

    await auth.convertAnonymousToAuthenticated(session.session_id, token)

    // Clear anonymous data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kyrah_anonymous_session_id')
      localStorage.removeItem('kyrah_anonymous_token')
    }

    // Refresh session
    await checkSession()
  }

  async function handleSignInWithEmail(
    email: string,
    password: string
  ): Promise<void> {
    await auth.signInWithEmail(email, password)
    // Session will be set by onAuthStateChange
  }

  async function handleSignUpWithEmail(
    email: string,
    password: string
  ): Promise<void> {
    await auth.signUpWithEmail(email, password)
    // Session will be set by onAuthStateChange after email confirmation
  }

  async function handleSignOut(): Promise<void> {
    await auth.signOut()
    clearSessionState()
  }

  const value: AuthContextType = {
    user,
    session,
    authType,
    loading,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    signOut: handleSignOut,
    startAnonymous,
    convertToAuthenticated,
    updatePreferences: auth.updateUserPreferences,
    getPreferences: auth.getUserPreferences,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}