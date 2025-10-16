// @/features/chat/hooks/useGetUserSesssions.ts

import { useQuery } from '@tanstack/react-query';
import { getUserSessions } from '@/lib/auth';

export const useGetUserSessions = (userId: string) => {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>useGetUserSessions userId', userId);
  return useQuery({
    queryKey: ['user-sessions', userId],
    queryFn: async () => {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>useGetUserSessions queryFn userId', userId);
      const data = await getUserSessions(userId);
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>useGetUserSessions queryFn data', data);
      return data;
    },
    enabled: !!userId,
    // staleTime: 30000, // Cache for 30 seconds
  });
};