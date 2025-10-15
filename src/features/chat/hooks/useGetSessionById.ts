// @/features/chat/hooks/useGetSessionById.ts

import { useQuery } from '@tanstack/react-query';
import { getSessionById } from '@/lib/auth';

export const useGetSessionById = (sessionId: string) => {
  return useQuery({
    queryKey: ['session-by-id', sessionId],
    queryFn: () => getSessionById(sessionId),
    enabled: !!sessionId,
    staleTime: 30000,
  });
};