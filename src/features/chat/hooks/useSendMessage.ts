// src/features/chat/hooks/useSendMessage.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessageWithAI } from '@/lib/chat';

export const useSendMessage = (sessionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendMessageWithAI({ sessionId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-messages', sessionId] });
    },
  });
};