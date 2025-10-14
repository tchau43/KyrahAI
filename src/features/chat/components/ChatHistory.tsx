'use client';

import SessionItem from './SessionItem';

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
          <SessionItem
            key={id}
            sessionId={id}
            isActive={activeSessionId === id}
            onSelect={onSelectSession}
          />
        ))}
      </div>
    </div>
  );
}
