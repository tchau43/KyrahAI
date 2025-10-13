// src/features/auth/hooks/useStartAnonymousSession.ts

import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useStartAnonymousSession() {
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>useStartAnonymousSession");
  const { startAnonymous } = useAuth();
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>startAnonymous", startAnonymous);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["startAnonymousSession"],
    mutationFn: async () => {
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>mutationFn");
      // Start new anonymous session via context method
      const result = await startAnonymous();
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>result", result);
      return result;
    },
    onSuccess: () => {
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>onSuccess");
      // Refresh any session-dependent queries
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => {
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>onError", error);
    },
  });
}
