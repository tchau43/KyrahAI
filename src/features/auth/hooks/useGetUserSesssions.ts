// @/features/auth/hooks/useGetUserSesssions.ts

import { useQuery } from '@tanstack/react-query';
import { getUserSessions } from '@/lib/auth';

export const useGetUserSessions = (userId: string) => {
  // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>useGetUserSessions');
  // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>userId', userId);
  return useQuery({
    queryKey: ['user-sessions', userId],
    queryFn: () => getUserSessions(userId),
  });
};