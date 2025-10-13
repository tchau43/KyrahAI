'use client';

import { Button } from '@heroui/react';

interface ChatHistoryProps {
  sessionIds: string[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
}

export default function ChatHistory({
  sessionIds,
  activeSessionId,
  onSelectSession,
}: ChatHistoryProps) {
  return (
    <div className="flex-1 overflow-y-auto p-2">
      <div className="text-xs font-semibold text-neutral-9 px-3 py-2 uppercase tracking-normal">
        Sessions
      </div>
      <div className="space-y-1">
        {sessionIds.map(id => (
          <Button
            key={id}
            onPress={() => onSelectSession(id)}
            className={`w-full justify-start px-3 py-3 h-auto ${activeSessionId === id
                ? 'bg-neutral-3 text-neutral-9'
                : 'bg-transparent text-neutral-8'
              }`}
            variant="light"
          >
            <div className="body-14-semi truncate w-full text-left">
              {id}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
