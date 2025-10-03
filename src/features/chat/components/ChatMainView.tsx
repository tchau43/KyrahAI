'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@heroui/react';
import { Conversation, Message } from '../data';
import ChatBubble from './ChatBubble';

interface ChatMainViewProps {
  conversation: Conversation | null;
  onSendMessage: (content: string) => void;
  onToggleSidebar: () => void;
}

export default function ChatMainView({
  conversation,
  onSendMessage,
  onToggleSidebar,
}: ChatMainViewProps) {
  const [inputValue, setInputValue] = useState('');
  const [isMultiline, setIsMultiline] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  // Auto-resize textarea and check if multiline
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;

      // Check if multiline (height greater than single line or contains newline)
      setIsMultiline(scrollHeight > 36 || inputValue.includes('\n'));
    }
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      setIsMultiline(false);
      // Reset textarea height
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

  const hasMessages = conversation && conversation.messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-screen bg-neutral relative">
      {hasMessages ? (
        <>
          {/* Messages */}
          <div className="flex h-full flex-col overflow-y-auto thread-xl:pt-(--header-height) [scrollbar-gutter:stable_both-edges]">
            <div className="max-w-3xl mx-auto py-6 pb-32">
              {conversation.messages.map(message => (
                <ChatBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="absolute bottom-0 left-0 right-0 pb-4 bg-gradient-to-t from-neutral via-neutral/95 to-transparent">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              <div
                className={`w-full bg-white border border-neutral-3 ${
                  isMultiline ? 'rounded-[1.75rem]' : 'rounded-full'
                } p-[0.625rem] min-h-[2.25rem] flex items-center`}
              >
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={1}
                  className="flex-1 resize-none outline-none body-16-regular text-neutral-9 placeholder:text-neutral-5 bg-transparent max-h-[9rem] overflow-y-auto pl-4"
                />
              </div>
              <p className="text-xs text-neutral-6 text-center mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </form>
          </div>
        </>
      ) : (
        <>
          {/* Empty State - Centered */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <h1 className="heading-32 text-neutral-9 mb-12 text-center">
              What can I help you with?
            </h1>
            <form onSubmit={handleSubmit} className="w-full max-w-2xl">
              <div
                className={`w-full bg-white border border-neutral-3 shadow-sm ${
                  isMultiline ? 'rounded-[1.75rem]' : 'rounded-full'
                } p-[0.625rem] min-h-[2.25rem] flex items-center`}
              >
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  rows={1}
                  className="flex-1 resize-none outline-none body-16-regular text-neutral-9 placeholder:text-neutral-5 bg-transparent max-h-[9rem] overflow-y-auto px-4"
                />
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
