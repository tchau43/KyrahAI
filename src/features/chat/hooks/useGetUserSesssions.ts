// @/features/chat/hooks/useGetUserSesssions.ts

import { useQuery } from '@tanstack/react-query';
import { getUserSessions } from '@/lib/auth';

export const useGetUserSessions = (userId: string) => {
  return useQuery({
    queryKey: ['user-sessions', userId],
    queryFn: () => getUserSessions(userId),
    enabled: !!userId,
    staleTime: 30000, // Cache for 30 seconds
  });
};