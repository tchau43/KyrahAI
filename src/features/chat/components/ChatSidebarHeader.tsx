'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@heroui/react';

interface ChatSidebarHeaderProps {
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

export default function ChatSidebarHeader({
  onNewChat,
  onToggleSidebar,
}: ChatSidebarHeaderProps) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-10">
        <Link href="/" className="flex items-center">
          <Image
            src="/kyrah-logo.svg"
            alt="Kyrah Logo"
            width={24}
            height={24}
          />
        </Link>
      </div>
      <Button
        onPress={onNewChat}
        className="w-full justify-start bg-transparent hover:bg-neutral-2 text-neutral-9 text-small font-inter font-medium gap-3 px-0"
        variant="light"
        startContent={
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
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
    </div>
  );
}
