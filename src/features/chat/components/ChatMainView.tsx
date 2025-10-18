'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { Message } from '../data';
import ChatBubble from './ChatBubble';
import { KyrahAI } from '@/components/icons';
import { Resource } from '@/types/risk-assessment';
import { ResourceList } from '@/components/cards/HotlineCard';

// Extend Message type to include resources
interface MessageWithResources extends Message {
  isStreaming?: boolean;
  resources?: Resource[];
  riskLevel?: string;
}

interface ChatMainViewProps {
  messages: MessageWithResources[] | null;
  onSendMessage: (content: string) => void;
  onToggleSidebar: () => void;
  onNewChat?: () => void;
  greetingMessage?: string;
  showHeader?: boolean;
  suggestionMessages?: string[];
}

export default function ChatMainView({
  messages,
  onSendMessage,
  onNewChat,
  greetingMessage = "What can I help you with?",
  showHeader = false,
  suggestionMessages = [],
}: ChatMainViewProps) {
  const [inputValue, setInputValue] = useState('');
  const [isMultiline, setIsMultiline] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea and check if multiline
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;

      setIsMultiline(scrollHeight > 36 || inputValue.includes('\n'));
    }
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      setIsMultiline(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleResourceClick = async (resourceId: string) => {
    try {
      await fetch('/api/resources/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId,
          sessionId: messages?.[0]?.session_id
        }),
      });
    } catch (err) {
      console.error('Failed to track resource click:', err);
    }
  };

  const hasMessages = messages && messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-screen bg-neutral relative overflow-hidden">
      {showHeader && (
        <div className="absolute flex-col top-4 left-4 md:top-6 md:left-6 z-20 flex items-center gap-3 md:gap-4">
          <Link href="/" className="flex items-center">
            <KyrahAI height={40} width={170} className="md:h-12 md:w-[204px]" />
          </Link>

          {onNewChat && (
            <Button
              onPress={onNewChat}
              className="justify-center w-full bg-transparent hover:bg-neutral-2 text-neutral-9 body-16-medium gap-3 px-0"
              variant="light"
              startContent={
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
              }
            >
              New chat
            </Button>
          )}
        </div>
      )}

      {hasMessages ? (
        <>
          <div className="flex-1 overflow-y-auto [scrollbar-gutter:stable_both-edges]">
            <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 py-4 md:py-6 pb-[180px] md:pb-[200px] lg:pb-[220px]">
              <div className="max-w-full md:max-w-[85%] lg:max-w-[75%] xl:max-w-[70%] mx-auto">
                {messages.map((message, idx) => {

                  return (
                    <div key={`${message.message_id}-${idx}`}>
                      <ChatBubble message={message} />

                      {/* CRITICAL: Render resources if available */}
                      {message.resources && message.resources.length > 0 && (
                        <div className="mt-4">
                          <ResourceList
                            resources={message.resources}
                            riskLevel={message.riskLevel}
                            onResourceClick={handleResourceClick}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 pb-3 md:pb-4 lg:pb-6 bg-neutral">
            <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12">
              <form onSubmit={handleSubmit} className="max-w-full md:max-w-2xl lg:max-w-3xl xl:max-w-3xl mx-auto">
                <div
                  className={`w-full bg-white border border-neutral-3 shadow-lg ${isMultiline ? 'rounded-[1.75rem]' : 'rounded-full'
                    } p-2 md:p-[0.625rem] min-h-[2.25rem] flex items-center`}
                >
                  <textarea
                    aria-label="Message input"
                    ref={textareaRef}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    rows={1}
                    className="flex-1 resize-none outline-none caption-14-regular md:!text-[16px] text-neutral-9 placeholder:text-neutral-5 bg-transparent max-h-[9rem] overflow-y-auto pl-3 md:pl-4"
                  />
                </div>
                <p className="caption-12-regular md:!text-[14px] text-neutral-6 text-center mt-1.5 md:mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </form>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 lg:px-8 pb-[120px]">
            <h1 className="heading-32 md:heading-40 text-neutral-9 mb-8 md:mb-10 lg:mb-12 text-center transition-all duration-300">
              {greetingMessage}
            </h1>
            <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12">
              <form onSubmit={handleSubmit} className="max-w-full md:max-w-2xl lg:max-w-3xl xl:max-w-3xl mx-auto">
                <div
                  className={`w-full bg-white border border-neutral-3 shadow-sm ${isMultiline ? 'rounded-[1.75rem]' : 'rounded-full'
                    } p-2 md:p-[0.625rem] min-h-[2.25rem] flex items-center`}
                >
                  <textarea
                    aria-label="Message input"
                    ref={textareaRef}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    rows={1}
                    className="flex-1 resize-none outline-none caption-14-regular md:!text-[16px] text-neutral-9 placeholder:text-neutral-5 bg-transparent max-h-[9rem] overflow-y-auto px-3 md:px-4"
                  />
                </div>

                {/* Suggestion chips */}
                {suggestionMessages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {suggestionMessages.map((suggestion, index) => (
                      <Button
                        key={index}
                        onPress={() => onSendMessage(suggestion)}
                        variant="flat"
                        className="bg-white border border-neutral-3 text-neutral-8 hover:bg-neutral-1 hover:border-neutral-4 caption-14-regular md:!body-16-regular px-4 py-2 rounded-full transition-all duration-200"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}