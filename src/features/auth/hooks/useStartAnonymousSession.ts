// src/features/auth/hooks/useStartAnonymousSession.ts

import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useStartAnonymousSession() {
  const { startAnonymous } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["startAnonymousSession"],
    mutationFn: async () => {
      // Start new anonymous session via context method
      const result = await startAnonymous();
      return result;
    },
    onSuccess: () => {
      // Refresh any session-dependent queries
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => {
    },
  });
}
