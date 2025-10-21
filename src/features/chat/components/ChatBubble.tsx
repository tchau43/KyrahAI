'use client';

import { Card, CardBody } from '@heroui/react';
import { Message } from '../data';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useMemo } from 'react';
import type { UserPreferences } from '@/types/auth.types';

interface ChatBubbleProps {
  message: Message & { isStreaming?: boolean };
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const { getPreferences } = useAuth();
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;

  useEffect(() => {
    if (!preferencesLoaded) {
      const loadPreferences = async () => {
        try {
          const prefs = await getPreferences();
          setUserPreferences(prefs);
          setPreferencesLoaded(true);
        } catch (error) {
          console.error('Error loading user preferences:', error);
          setPreferencesLoaded(true); // Mark as loaded even on error to avoid retries
        }
      };

      loadPreferences();
    }
  }, [getPreferences, preferencesLoaded]);

  const formatTimestamp = useMemo(() => {
    return (timestamp: string) => {
      try {
        const date = new Date(timestamp);

        // Use user's timezone if available, otherwise fallback to browser timezone
        const timezone = userPreferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

        return date.toLocaleTimeString('vi-VN', {
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
  }, [userPreferences?.timezone]);

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
