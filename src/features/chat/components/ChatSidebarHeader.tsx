// src/features/chat/components/ChatSidebarHeader.tsx
'use client';

import Link from 'next/link';
import { Button } from '@heroui/react';
import { Folder, KyrahAI } from '@/components/icons';

interface ChatSidebarHeaderProps {
  onNewChat: () => void;
  onNewFolder: () => void;
  onToggleSidebar: () => void;
  showCollapseButton?: boolean;
}

export default function ChatSidebarHeader({
  onNewChat,
  onNewFolder,
  onToggleSidebar,
  showCollapseButton = true,
}: ChatSidebarHeaderProps) {
  return (
    <div className="p-4 relative">
      <div className="flex items-center justify-between mb-7">
        <Link href="/" className="flex items-center">
          <KyrahAI height={40} width={170} />
        </Link>
      </div>
      <Button
        onPress={onNewChat}
        className="w-full justify-start bg-transparent hover:bg-neutral-2 text-neutral-9 body-16-medium gap-3.5 px-0"
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
      <Button
        onPress={onNewFolder}
        className="w-full justify-start bg-transparent hover:bg-neutral-2 text-neutral-9 body-16-medium gap-3 px-0"
        variant="light"
        startContent={<Folder />}
      >
        New folder
      </Button>

      {showCollapseButton && (
        <Button
          isIconOnly
          variant="light"
          className="hidden xl:flex absolute top-2 right-4 z-10"
          onPress={onToggleSidebar}
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
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
        </Button>
      )}
    </div>
  );
}