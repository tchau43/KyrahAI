// src/features/chat/components/ChatHistory.tsx
'use client';

import { Session } from '@/types/auth.types';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@heroui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

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
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();


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
        .select('session_id')
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

  const handleEditTitle = (sessionId: string) => {
    const session = sessions.find(s => s.session_id === sessionId);
    if (session) {
      setEditingSessionId(sessionId);
      setEditTitle(session.title || session.session_id);
      // Focus input after render
      // setTimeout(() => inputRef.current?.focus(), 0);
      inputRef.current?.focus()
    }
  };

  const handleSaveTitle = async (sessionId: string) => {
    if (!editTitle.trim()) {
      // Don't save empty title
      setEditingSessionId(null);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('sessions')
        .update({ title: editTitle.trim() })
        .eq('session_id', sessionId);

      await queryClient.invalidateQueries({ queryKey: ['user-sessions', user?.id] });

      if (error) {
        console.error('Error updating title:', error);
      }
    } catch (error) {
      console.error('Error saving title:', error);
    } finally {
      setEditingSessionId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditTitle('');
  };

  // Auto-focus input when editing starts
  useEffect(() => {
    if (editingSessionId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingSessionId]);

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
                  onPress={() => {
                    if (editingSessionId !== session.session_id) {
                      onSelectSession(session.session_id);
                    }
                  }}
                  className={`group w-full justify-start px-3 py-2 h-auto transition-colors ${activeSessionId === session.session_id
                    ? 'bg-primary text-white hover:bg-primary/90 hover:text-neutral-1'
                    : 'bg-transparent text-neutral-8 hover:bg-neutral-3 hover:text-neutral-9'
                    } `}
                >
                  <div className="w-full flex items-center gap-1">
                    {editingSessionId === session.session_id ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveTitle(session.session_id);
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                        onBlur={handleCancelEdit}
                        className="flex-1 min-w-0 text-neutral-9 px-2 py-1 rounded border border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                      />
                    ) : (
                      <span className="flex-1 min-w-0 text-left whitespace-nowrap overflow-visible group-hover:overflow-hidden group-hover:truncate group-hover:pr-3">
                        {session?.title || session.session_id}
                      </span>
                    )}
                    <div
                      role="button"
                      tabIndex={0}
                      aria-haspopup="menu"
                      aria-expanded={openDropdownId === session.session_id}
                      aria-controls={`session-menu-${session.session_id}`}
                      onClick={(e) => handleDropdownToggle(session.session_id, e)}
                      onPointerDown={(e) => e.stopPropagation()}
                      className={`-mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 rotate-90 cursor-pointer hover:bg-white/10 rounded p-1 ${activeSessionId === session.session_id ? 'text-neutral-1' : 'text-neutral-9'} font-semibold md:!text-[1rem] xl:!text-[1.125rem]`}
                    >
                      ...
                    </div>
                  </div>
                </Button>
                {openDropdownId === session.session_id && !editingSessionId && (
                  <div
                    id={`session-menu-${session.session_id}`}
                    ref={dropdownRef}
                    className="absolute right-0 mt-1 w-44 bg-white border border-neutral-3 rounded-lg shadow-lg z-50 py-1"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(null);
                        handleEditTitle(session.session_id);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-8 hover:bg-neutral-2 transition-colors"
                    >
                      Edit title
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-8 hover:bg-neutral-2 transition-colors"
                    >
                      Add to folder
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
