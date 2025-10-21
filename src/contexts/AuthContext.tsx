'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { createClient } from '../utils/supabase/client'
import * as auth from '../lib/auth'
import type {
  SupabaseUser,
  Session,
  AnonymousSessionResult,
  UserPreferences,
  UserPreferencesUpdate,
} from '../types/auth.types'

interface AuthContextType {
  user: SupabaseUser | null
  session: Session | null
  authType: 'authenticated' | 'anonymous' | null
  loading: boolean
  userPreferences: UserPreferences | null
  preferencesLoading: boolean

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


export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


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
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)
  const [preferencesLoading, setPreferencesLoading] = useState<boolean>(false)

  useEffect(() => {
    const supabase = createClient()
    checkSession()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {

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

  // Load preferences when user changes
  useEffect(() => {
    if (user && !preferencesLoading && !userPreferences) {
      loadUserPreferences()
    } else if (!user) {
      setUserPreferences(null)
    }
  }, [user, preferencesLoading, userPreferences])

  async function loadUserPreferences(): Promise<void> {
    if (preferencesLoading) return

    setPreferencesLoading(true)
    try {
      const prefs = await auth.getUserPreferences()
      setUserPreferences(prefs)
    } catch (error) {
      console.error('Error loading user preferences:', error)
    } finally {
      setPreferencesLoading(false)
    }
  }

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
    // Clear all previous session data (anonymous or old authenticated)
    clearSessionState()

    setUser(authSession.user as SupabaseUser)
    setAuthType('authenticated')

    // Create a new temp session for the authenticated user
    const temp = await auth.createTempSession()
    setSession({
      // minimal in-memory shape until persisted
      session_id: temp.session_id,
      user_id: authSession.user.id,
      is_anonymous: false,
      auth_type: 'email',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      last_activity_at: new Date().toISOString(),
      deleted_at: null,
      config: {
        retention_days: 30,
        language: typeof navigator !== 'undefined' ? (navigator.language?.split('-')[0] || 'en') : 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezone_offset: auth.getTimezoneOffset(Intl.DateTimeFormat().resolvedOptions().timeZone),
      },
      metadata: {},
      title: '',
    } as Session)
  }

  function clearSessionState(): void {
    setUser(null)
    setSession(null)
    setAuthType(null)
    setUserPreferences(null)

    // Clear ALL session data from storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kyrah_anonymous_session_id')
      sessionStorage.removeItem('kyrah_temp_session_id')
      sessionStorage.removeItem('kyrah_anonymous_token')
    }
  }

  async function startAnonymous(): Promise<AnonymousSessionResult> {
    try {
      const result = await auth.startAnonymousSession()
      // Build minimal in-memory session from temp id
      const tempId = auth.getTempSessionId()
      if (tempId) {
        setSession({
          session_id: tempId,
          user_id: null,
          is_anonymous: true,
          auth_type: 'anonymous',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          last_activity_at: new Date().toISOString(),
          deleted_at: null,
          config: {
            retention_days: 1,
            language: typeof navigator !== 'undefined' ? (navigator.language?.split('-')[0] || 'en') : 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezone_offset: auth.getTimezoneOffset(Intl.DateTimeFormat().resolvedOptions().timeZone),
          },
          metadata: {},
          title: '',
        } as Session)
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

    const token = sessionStorage.getItem('kyrah_anonymous_token')
    if (!token) {
      throw new Error('No anonymous token found')
    }

    await auth.convertAnonymousToAuthenticated(session.session_id, token)

    // Clear anonymous data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kyrah_anonymous_session_id')
      sessionStorage.removeItem('kyrah_anonymous_token')
      sessionStorage.removeItem('kyrah_temp_session_id')
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
    userPreferences,
    preferencesLoading,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    signOut: handleSignOut,
    startAnonymous,
    convertToAuthenticated,
    updatePreferences: async (prefs) => {
      const updated = await auth.updateUserPreferences(prefs);
      setUserPreferences(updated);
      return updated;
    },
    getPreferences: auth.getUserPreferences,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}