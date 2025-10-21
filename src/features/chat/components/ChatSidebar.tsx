'use client';

import { useEffect, useState } from 'react';
import { Button } from '@heroui/react';
import ChatSidebarHeader from './ChatSidebarHeader';
import ChatHistory from './ChatHistory';
import ChatSidebarFooter from './ChatSidebarFooter';
import { createClient } from '@/utils/supabase/client';
import { Session } from '@/types/auth.types';
import { XIcon } from '@/components/icons';

interface ChatSidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export default function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  isOpen,
  onClose,
  isLoading = false,
}: ChatSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Use getUser() instead of getSession() for proper validation
    supabase.auth.getUser().then(({ data }) => setHasUser(!!data.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setHasUser(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!hasUser) return null;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 pointer-events-auto xl:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`
          fixed xl:relative inset-y-0 left-0 z-50 bg-neutral flex flex-col border-r border-neutral-2 
          transition-all duration-300
          ${isCollapsed ? 'xl:w-16' : 'w-72 xl:w-72'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
        `}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 xl:hidden p-2 rounded-full hover:bg-neutral-2 transition-colors z-10"
          aria-label="Close sidebar"
        >
          <XIcon size={20} className="text-neutral-9" />
        </button>

        <div className={isCollapsed ? 'hidden xl:hidden' : ''}>
          <ChatSidebarHeader
            onNewChat={onNewChat}
            onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
            showCollapseButton={true}
          />
        </div>

        {isCollapsed && (
          <div className="p-4">
            <div className="flex items-center justify-center mb-10 relative">
              <Button
                isIconOnly
                variant="light"
                className="hidden xl:flex"
                onPress={() => setIsCollapsed(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="rotate-180"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
              </Button>
            </div>
          </div>
        )}

        <div className={isCollapsed ? 'hidden xl:hidden flex-1 min-h-0' : 'flex-1 min-h-0'}>
          {isLoading ? (
            <div className="flex flex-col h-full">
              <div className="text-xs font-semibold text-neutral-9 px-3 py-2 uppercase tracking-normal flex-shrink-0">
                Sessions
              </div>
              <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-0">
                <div className="space-y-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="w-full justify-start px-3 py-3 h-auto bg-transparent"
                    >
                      <div className="h-4 bg-neutral-3 rounded animate-pulse w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <ChatHistory
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={onSelectSession}
            />
          )}
        </div>

        {isCollapsed && <div className="flex-1" />}

        <ChatSidebarFooter isCollapsed={isCollapsed} />
      </aside>
    </>
  );
}