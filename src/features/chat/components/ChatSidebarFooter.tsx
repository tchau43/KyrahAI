'use client';

import { User } from '@heroui/react';

export default function ChatSidebarFooter() {
  return (
    <div className="px-4 py-2 border-t border-neutral-2">
      <User
        name="Anonymous"
        description="Guest User"
        avatarProps={{
          size: 'sm',
          name: 'Anonymous',
          className: 'bg-neutral-9 text-white',
        }}
        classNames={{
          name: 'body-14-semi text-neutral-9',
          description: 'text-xs text-neutral-6',
        }}
      />
    </div>
  );
}
