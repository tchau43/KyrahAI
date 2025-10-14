// src/features/auth/hooks/useSignInWithEmail.ts

import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getUserSessions } from '@/lib/auth';

export function useSignInWithEmail() {
  const { signInWithEmail } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password }: { email: string, password: string }) => signInWithEmail(email, password),

    onSuccess: async () => {
      // Ensure session query updates
      await queryClient.invalidateQueries({ queryKey: ['session'] })

      // Get current user id ASAP after sign-in
      const { data: { user } } = await supabase.auth.getUser()

      // Prefetch user's sessions to avoid blank UI after redirect
      if (user?.id) {
        await queryClient.prefetchQuery({
          queryKey: ['user-sessions', user.id],
          queryFn: () => getUserSessions(user.id),
        })
      }

      // Invalidate and refetch any cached session-related queries
      const predicate = (q: any) => {
        const key0 = q?.queryKey?.[0]
        return key0 === 'user-sessions' || key0 === 'session-messages' || key0 === 'session-by-id'
      }
      await queryClient.invalidateQueries({ predicate })
      await queryClient.refetchQueries({ predicate })

      router.push('/chat')
    }
  })
}
