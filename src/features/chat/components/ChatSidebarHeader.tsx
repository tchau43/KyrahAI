// src/features/chat/components/ChatSidebarHeader.tsx
'use client';

import { Folder, KyrahAI, KyrahAILogo } from '@/components/icons';

interface ChatSidebarHeaderProps {
  onNewChat: () => void;
  onNewFolder: () => void;
  onToggleSidebar: () => void;
  isCollapsed: boolean;
}

export default function ChatSidebarHeader({
  onNewChat,
  onNewFolder,
  onToggleSidebar,
  isCollapsed,
}: ChatSidebarHeaderProps) {
  return (
    <div className="p-2 pt-3">
      {/* collapse button */}
      <div className="h-[40px] mb-8 flex items-center pr-1">
        <div className="flex-1" >
          {!isCollapsed && (
            <KyrahAI width={170} height={40} />
          )}
        </div>
        <button
          type="button"
          className="hidden xl:flex z-10 text-neutral-9 p-2 rounded-lg hover:bg-neutral-2 transition-colors group relative"
          onClick={onToggleSidebar}
        >
          {/* Default icon */}
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
            className={`transition-all w-6 h-6 duration-300 opacity-0 scale-0 ${isCollapsed ? 'rotate-180 group-hover:opacity-100 group-hover:scale-100' : 'opacity-100 scale-100'}`}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>

          {/* Hover icon */}
          <KyrahAILogo
            className={`absolute transition-all duration-300 group-hover:opacity-0 group-hover:scale-0 w-6 h-6 ${isCollapsed ? 'block' : 'hidden'}`}
          />
        </button>
      </div>

      {/* buttons container */}
      <div className="flex flex-col gap-2">
        {/* New chat button */}
        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex justify-start items-center bg-transparent hover:bg-neutral-2 text-neutral-9 body-16-medium gap-3.5 py-2 pl-3 rounded-lg transition-colors whitespace-nowrap"
        >
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
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
          <p className={`${isCollapsed ? 'hidden' : ''}`}>New chat</p>
        </button>
        {/* New folder button */}
        <button
          type="button"
          onClick={onNewFolder}
          className={`${isCollapsed ? 'hidden' : ''} w-full flex justify-start items-center bg-transparent hover:bg-neutral-2 text-neutral-9 body-16-medium gap-3 pl-3 py-2 rounded-lg transition-colors whitespace-nowrap`}
        >
          <div className="flex items-center justify-center flex-shrink-0 w-6 h-6">
            <Folder className="text-neutral-9" />
          </div>
          <p className={`${isCollapsed ? 'hidden' : ''}`}>New folder</p>
        </button>
      </div>
    </div>
  );
}