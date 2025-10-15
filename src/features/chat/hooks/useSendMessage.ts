// src/features/chat/hooks/useSendMessage.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage } from '@/lib/auth';

export const useSendMessage = (sessionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendMessage(sessionId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-messages', sessionId] });
    },
  });
};