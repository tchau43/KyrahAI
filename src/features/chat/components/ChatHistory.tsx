'use client';

import { Session } from '@/types/auth.types';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from '@heroui/react';

interface ChatHistoryProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
}

export default function ChatHistory({
  sessions,
  activeSessionId,
  onSelectSession,
}: ChatHistoryProps) {
  const [nonEmptySessionIds, setNonEmptySessionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    async function loadCounts() {
      const supabase = createClient();
      const ids = sessions.map(s => s.session_id);
      if (ids.length === 0) {
        if (isMounted) setNonEmptySessionIds(new Set());
        return;
      }
      const { data, error } = await supabase
        .from('messages')
        .select('session_id', { count: 'exact' })
        .in('session_id', ids)
        .is('deleted_at', null);

      if (error) {
        if (isMounted) setNonEmptySessionIds(new Set(ids));
        return;
      }

      const hasMessage = new Set<string>();

      (data || []).forEach(row => {
        if (row && row.session_id) hasMessage.add(row.session_id as string);
      });

      if (isMounted) setNonEmptySessionIds(hasMessage);
    }
    void loadCounts();
    return () => { isMounted = false; };
  }, [sessions]);
  return (
    <div className="flex flex-col h-full">
      <div className="text-xs font-semibold text-neutral-9 px-3 py-2 uppercase tracking-normal flex-shrink-0">
        Sessions
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-0">
        <div className="space-y-1">
          {sessions
            .filter(session => nonEmptySessionIds.has(session.session_id))
            .map(session => (
              <Button
                key={session.session_id}
                onPress={() => onSelectSession(session.session_id)}
                className={`w-full justify-start px-3 py-3 h-auto ${activeSessionId === session.session_id
                  ? 'bg-neutral-3 text-neutral-9'
                  : 'bg-transparent text-neutral-8'
                  }`}
                variant="light"
              >
                <div className="body-14-semi truncate w-full text-left">
                  {session?.title || session.session_id}
                </div>
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
}
