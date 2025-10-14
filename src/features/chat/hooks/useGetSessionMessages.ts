// @/features/chat/hooks/useGetSessionMessages.ts

import { useQuery } from '@tanstack/react-query';
import { getSessionMessages } from '@/lib/auth';
import { GetMessagesParams } from '../data';

export const useGetSessionMessages = (params: GetMessagesParams) => {
  return useQuery({
    queryKey: ['session-messages', params.sessionId, params.limit, params.offset],
    queryFn: async () => {
      const data = await getSessionMessages(params);
      return data;
    },
    enabled: !!params.sessionId,
    staleTime: 30000,
  });
};