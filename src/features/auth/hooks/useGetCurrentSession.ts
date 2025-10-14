// src/features/auth/hooks/useGetCurrentSession.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getCurrentSession } from '@/lib/auth';
import type { CurrentSession } from '@/types/auth.types';

type SessionStatus = 'loading' | 'authenticated' | 'anonymous' | 'none' | 'error';

interface UseGetCurrentSessionState {
  status: SessionStatus;
  data: CurrentSession | null;
  error?: Error;
}

interface UseGetCurrentSessionOptions {
  auto?: boolean; // auto fetch on mount (default true)
  refreshOnFocus?: boolean; // refetch on window focus (default true)
}

export function useGetCurrentSession(options: UseGetCurrentSessionOptions = {}): {
  state: UseGetCurrentSessionState;
  refresh: () => Promise<void>;
  isAuthenticated: boolean;
  isAnonymous: boolean;
} {
  const { auto = true, refreshOnFocus = true } = options;

  const [state, setState] = useState<UseGetCurrentSessionState>({
    status: 'loading',
    data: null,
  });

  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      if (!mountedRef.current) return;
      setState((prev) => ({ ...prev, status: 'loading', error: undefined }));

      const result = await getCurrentSession();

      if (!mountedRef.current) return;

      if (!result) {
        setState({ status: 'none', data: null });
        return;
      }

      if (result.type === 'authenticated') {
        setState({ status: 'authenticated', data: result });
      } else {
        setState({ status: 'anonymous', data: result });
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setState({ status: 'error', data: null, error: err as Error });
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (auto) {
      void refresh();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [auto, refresh]);

  useEffect(() => {
    if (!refreshOnFocus) return;

    const handleFocus = () => {
      // Avoid spamming if already loading
      if (state.status !== 'loading') {
        void refresh();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [refreshOnFocus, refresh, state.status]);

  const isAuthenticated = useMemo(() => state.status === 'authenticated', [state.status]);
  const isAnonymous = useMemo(() => state.status === 'anonymous', [state.status]);

  return { state, refresh, isAuthenticated, isAnonymous };
}

export default useGetCurrentSession;