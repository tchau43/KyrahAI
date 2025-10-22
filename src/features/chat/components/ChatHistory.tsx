// src/features/chat/components/ChatHistory.tsx
'use client';

import { Session } from '@/types/auth.types';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, useRef } from 'react';
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
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }

    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdownId]);

  const handleDropdownToggle = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenDropdownId(openDropdownId === sessionId ? null : sessionId);
  };

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
              <div key={session.session_id} className='relative'>
                <Button
                  key={session.session_id}
                  onPress={() => onSelectSession(session.session_id)}
                  className={`group w-full justify-start px-3 py-2 h-auto transition-colors ${activeSessionId === session.session_id
                    ? 'bg-primary text-white hover:bg-primary/90 hover:text-neutral-1'
                    : 'bg-transparent text-neutral-8 hover:bg-neutral-3 hover:text-neutral-9'
                    } `}
                >
                  <div className="w-full flex items-center gap-1">
                    <span className="flex-1 min-w-0 text-left whitespace-nowrap overflow-visible group-hover:overflow-hidden group-hover:truncate group-hover:pr-3">
                      {session?.title || session.session_id}
                    </span>
                    <div
                      onClick={(e) => handleDropdownToggle(session.session_id, e)}
                      className={`-mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 rotate-90 cursor-pointer hover:bg-white/10 rounded p-1 ${activeSessionId === session.session_id ? 'text-neutral-1' : 'text-neutral-9'} font-semibold md:!text-[1rem] xl:!text-[1.125rem]`}
                    >
                      ...
                    </div>
                  </div>
                </Button>
                {openDropdownId === session.session_id && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-1 w-40 bg-white text-neutral-8 border border-neutral-3 rounded-lg shadow-lg z-50 py-2 px-4 flex flex-col gap-1"
                  >
                    <p>Edit title</p>
                    <p>Add to folder</p>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
