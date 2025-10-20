'use client';

import { useState, useCallback } from 'react';
import { Resource, RiskFlags } from '@/types/risk-assessment';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  resources?: Resource[];
  riskLevel?: string;
}

interface UseChatWithRiskReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  currentRiskLevel: string | null;
  detectedFlags: RiskFlags | null;
}

export function useChatWithRisk(sessionId: string): UseChatWithRiskReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [currentRiskLevel, setCurrentRiskLevel] = useState<string | null>(null);
  const [detectedFlags, setDetectedFlags] = useState<RiskFlags | null>(null);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      setIsLoading(true);
      setError(null);

      // Add user message immediately
      const userMessage: Message = {
        role: 'user',
        content: message,
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            sessionId,
            threadId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response stream');
        }

        let assistantMessage = '';
        let currentResources: Resource[] = [];
        let messageRiskLevel: string | null = null;

        // Read the stream
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                switch (data.type) {
                  case 'token':
                    // Append token to assistant message
                    assistantMessage += data.content;
                    // Update messages in real-time
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      const lastMessage = newMessages[newMessages.length - 1];
                      if (lastMessage && lastMessage.role === 'assistant') {
                        lastMessage.content = assistantMessage;
                      } else {
                        newMessages.push({
                          role: 'assistant',
                          content: assistantMessage,
                        });
                      }
                      return newMessages;
                    });
                    break;

                  case 'resources':
                    // Store resources
                    currentResources = data.resources;
                    messageRiskLevel = data.risk_level;
                    break;

                  case 'risk_assessment':
                    // Update risk level and flags
                    setCurrentRiskLevel(data.risk_level);
                    setDetectedFlags(data.flags);
                    messageRiskLevel = data.risk_level;
                    break;

                  case 'crisis_alert':
                    // Handle crisis alert
                    console.warn('Crisis keywords detected');
                    break;

                  case 'done':
                    // Update thread ID
                    if (data.threadId) {
                      setThreadId(data.threadId);
                    }
                    break;

                  case 'error':
                    throw new Error(data.error);
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }

        // Add final assistant message with resources
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.resources = currentResources;
            lastMessage.riskLevel = messageRiskLevel || undefined;
          }
          return newMessages;
        });
      } catch (err) {
        console.error('Error sending message:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, threadId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setThreadId(null);
    setCurrentRiskLevel(null);
    setDetectedFlags(null);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    currentRiskLevel,
    detectedFlags,
  };
}