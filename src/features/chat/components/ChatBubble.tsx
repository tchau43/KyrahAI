'use client';

import { Card, CardBody } from '@heroui/react';
import { Message } from '../data';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

interface ChatBubbleProps {
  message: Message & { isStreaming?: boolean };
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const { userPreferences } = useAuth();
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;

  const formatTimestamp = useMemo(() => {
    return (timestamp: string) => {
      try {
        const date = new Date(timestamp);

        // Use user's IANA timezone if available, otherwise fallback to browser timezone
        // timezone_offset is for display/metadata, timezone is the IANA name for formatting
        const timezone = userPreferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Use user's language preference, fallback to browser locale
        const lang = userPreferences?.language || Intl.DateTimeFormat().resolvedOptions().locale || 'en-US';
        const locale =
          lang.includes('-')
            ? lang
            : ({
              en: 'en-US',
              vi: 'vi-VN',
              fr: 'fr-FR',
              es: 'es-ES',
              pt: 'pt-BR',
              de: 'de-DE',
            } as Record<string, string>)[lang] ?? lang;

        return date.toLocaleTimeString(locale, {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } catch (error) {
        console.error('Error formatting timestamp:', error);
        return new Date(timestamp).toLocaleTimeString();
      }
    };
  }, [userPreferences?.timezone, userPreferences?.language]);

  return (
    <div className="flex flex-col mb-4">
      {/* text */}
      <div
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2 gap-3`}
      >
        {isUser ? (
          <Card className="max-w-[70%] bg-neutral-9">
            <CardBody className="px-4 py-3">
              <div className="body-16-regular whitespace-pre-wrap break-words text-white">
                {message.content}
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="w-full">
            <div className="body-16-regular whitespace-pre-wrap break-words text-neutral-9">
              {message.content}
              {isStreaming && message.content.length === 0 && (
                <span className="inline-block w-2 h-4 ml-1 bg-neutral-6 animate-pulse" />
              )}
              {isStreaming && message.content.length > 0 && (
                <span className="inline-block w-1 h-4 ml-1 bg-neutral-6 animate-pulse">▋</span>
              )}
            </div>
          </div>
        )}
      </div>
      {/* timestamp - only show when not streaming */}
      {!isStreaming && (
        <div className={`caption-14-regular !text-[0.875rem] text-neutral-5  ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTimestamp(message.timestamp)}
        </div>
      )}
    </div>
  );
}
