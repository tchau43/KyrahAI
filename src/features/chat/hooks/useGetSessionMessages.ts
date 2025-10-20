// @/features/chat/hooks/useGetSessionMessages.ts

import { useQuery } from '@tanstack/react-query';
import { getSessionMessages } from '@/lib/auth';
import { GetMessagesParams } from '../data';

export const useGetSessionMessages = (params: GetMessagesParams) => {
  // Auto-provide anonymous token from sessionStorage if not passed
  let token: string | undefined = params.anonymousToken;
  if (!token && typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem('kyrah_anonymous_token');
      if (stored) token = stored;
    } catch { }
  }

  return useQuery({
    queryKey: ['session-messages', params.sessionId, params.limit, params.offset],
    queryFn: async () => {
      const data = await getSessionMessages({ ...params, anonymousToken: token });
      return data;
    },
    enabled: !!params.sessionId,
    // staleTime: 30000,
  });
};