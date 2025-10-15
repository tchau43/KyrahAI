'use client';

import { useState } from 'react';
import { Button } from '@heroui/react';
import ChatSidebarHeader from './ChatSidebarHeader';
import ChatHistory from './ChatHistory';
import ChatSidebarFooter from './ChatSidebarFooter';
import { Session } from '@/types/auth.types';

interface ChatSidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 bg-neutral flex flex-col border-r border-neutral-2 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-72'
          } ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {!isCollapsed && (
          <>
            <ChatSidebarHeader
              onNewChat={onNewChat}
              onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
            />
            <ChatHistory
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={onSelectSession}
            />
            <ChatSidebarFooter />
          </>
        )}

        {/* Collapse/Expand Button */}
        <Button
          isIconOnly
          variant="light"
          className={`absolute top-2 ${isCollapsed ? 'left-1/2 -translate-x-1/2' : 'right-4'} z-10`}
          onPress={() => setIsCollapsed(!isCollapsed)}
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
            className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
        </Button>
      </aside>
    </>
  );
}
