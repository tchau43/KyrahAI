// src/features/chat/components/ChatHistory.tsx
'use client';

import { Session } from '@/types/auth.types';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@heroui/react';
import { useAuth } from '@/contexts/AuthContext';
import { FolderWithCount } from '@/lib/chat';
import { useQueryClient } from '@tanstack/react-query';
import { Folder, FolderHeart } from '@/components/icons';
import { useSessionTitleEditor } from '@/features/chat/hooks/useSessionTitleEditor';

interface ChatHistoryProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  folders: FolderWithCount[];
  onMoveToFolder: (sessionId: string, folderId: string | null) => void;
  onCreateFolderWithSession: (sessionId: string) => void;
}

export default function ChatHistory({
  sessions,
  activeSessionId,
  onSelectSession,
  folders,
  onMoveToFolder,
  onCreateFolderWithSession,
}: ChatHistoryProps) {
  const [nonEmptySessionIds, setNonEmptySessionIds] = useState<Set<string>>(new Set());
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Use custom hook for session title editing
  const {
    editingSessionId,
    editTitle,
    inputRef,
    setEditTitle,
    startEdit,
    saveTitle,
    cancelEdit,
  } = useSessionTitleEditor();
  const [showFolderSubmenu, setShowFolderSubmenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

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
        .is('deleted_at', null);

      if (error) {
        if (isMounted) setNonEmptySessionIds(new Set(ids));
        return;
      }

      const hasMessage = new Set<string>();
      data?.forEach(row => {
        if (row?.session_id) hasMessage.add(row.session_id);
      });

      if (isMounted) setNonEmptySessionIds(hasMessage);
    }
    void loadCounts();
    return () => { isMounted = false; };
  }, [sessions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const inDropdown = dropdownRef.current?.contains(target) ?? false;
      const inSubmenu = submenuRef.current?.contains(target) ?? false;

      if (!inDropdown && !inSubmenu) {
        setOpenDropdownId(null);
        setShowFolderSubmenu(null);
      }
    }

    if (openDropdownId || showFolderSubmenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdownId, showFolderSubmenu]);

  const handleDropdownToggle = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenDropdownId(openDropdownId === sessionId ? null : sessionId);
    setShowFolderSubmenu(null);
  };

  const handleEditTitle = (sessionId: string) => {
    const session = sessions.find(s => s.session_id === sessionId);
    if (session) {
      startEdit(sessionId, session.title || session.session_id);
      setOpenDropdownId(null);
    }
  };

  const handleSaveTitle = async (sessionId: string) => {
    await saveTitle(sessionId);
  };

  const handleCancelEdit = () => {
    cancelEdit();
  };

  const handleMoveToFolder = (sessionId: string, folderId: string | null) => {
    onMoveToFolder(sessionId, folderId);
    setOpenDropdownId(null);
    setShowFolderSubmenu(null);
  };

  const handleToggleFolderSubmenu = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setShowFolderSubmenu(showFolderSubmenu === sessionId ? null : sessionId);
  };


  // Handle tooltip positioning
  const handleMouseEnter = (sessionId: string, event: React.MouseEvent) => {
    setHoveredSessionId(sessionId);
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (hoveredSessionId) {
      setTooltipPosition({
        x: event.clientX,
        y: event.clientY
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredSessionId(null);
  };


  return (
    <div className="flex flex-col h-full">
      <div className="text-xs font-semibold text-neutral-9 px-3 py-2 uppercase tracking-normal flex-shrink-0">
        Sessions
      </div>
      <div className="flex-1 px-2 pb-2 min-h-0">
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
                    ? 'bg-primary text-secondary hover:bg-primary/95 hover:text-secondary/95'
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
                          e.stopPropagation();
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
                      <span
                        className="flex-1 min-w-0 text-left whitespace-nowrap group-hover:overflow-hidden overflow-hidden truncate group-hover:truncate group-hover:pr-3"
                        onMouseEnter={(e) => handleMouseEnter(session.session_id, e)}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                      >
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

                {/* Main Dropdown */}
                {openDropdownId === session.session_id && !editingSessionId && (
                  <div
                    ref={openDropdownId === session.session_id ? dropdownRef : null}
                    id={`session-menu-${session.session_id}`}
                    className="absolute right-2 top-full mt-1 w-48 bg-white text-neutral-8 border border-neutral-3 rounded-lg shadow-lg z-[60] py-2"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTitle(session.session_id);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-neutral-2 transition-colors"
                    >
                      Edit title
                    </button>

                    {/* Add to folder with submenu */}
                    <div className="relative">
                      <button
                        onClick={(e) => handleToggleFolderSubmenu(session.session_id, e)}
                        className="w-full px-4 py-2 text-left hover:bg-neutral-2 transition-colors flex items-center justify-between"
                      >
                        <span>Add to folder</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`transition-transform ${showFolderSubmenu === session.session_id ? 'rotate-90' : ''}`}
                        >
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>

                      {/* Folder Submenu */}
                      {showFolderSubmenu === session.session_id && (
                        <div
                          ref={submenuRef}
                          className="absolute left-0 top-full mt-1 w-full bg-white border border-neutral-3 rounded-lg shadow-lg z-[70] py-2 max-h-60 overflow-y-auto"
                        >
                          {/* Existing folders */}
                          <div className="max-h-40 overflow-y-auto">
                            {folders.length > 0 ? (
                              folders.map(folder => (
                                <button
                                  key={folder.folder_id}
                                  onClick={() => handleMoveToFolder(session.session_id, folder.folder_id)}
                                  className="flex gap-2 w-full px-4 py-2 text-left hover:bg-neutral-2 transition-colors text-sm truncate"
                                >
                                  <FolderHeart /> {folder.folder_name}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-2 text-sm text-neutral-7">
                                No folders yet
                              </div>
                            )}
                          </div>

                          {/* Create new folder */}
                          <div className="border-t border-neutral-3 my-1" />
                          <button
                            onClick={() => {
                              onCreateFolderWithSession(session.session_id);
                              setOpenDropdownId(null);
                              setShowFolderSubmenu(null);
                            }}
                            className="flex gap-2 w-full px-4 py-2 text-left hover:bg-neutral-2 transition-colors text-sm text-neutral-9 font-medium"
                          >
                            <Folder size={20} /> Create new folder
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Custom Tooltip */}
      {hoveredSessionId && (
        <div
          ref={tooltipRef}
          className="fixed z-[100] bg-neutral-9 text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none max-w-xs whitespace-nowrap"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 40,
          }}
        >
          {sessions.find(s => s.session_id === hoveredSessionId)?.title ||
            sessions.find(s => s.session_id === hoveredSessionId)?.session_id}
        </div>
      )}
    </div>
  );
}