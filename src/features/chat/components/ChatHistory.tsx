// src/features/chat/components/ChatHistory.tsx
'use client';

import { Session } from '@/types/auth.types';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, useRef } from 'react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { FolderWithCount } from '@/lib/chat';
import { Folder, FolderHeart } from '@/components/icons';
import { useSessionTitleEditor } from '@/features/chat/hooks/useSessionTitleEditor';
import { useOptimisticUpdates } from '@/features/chat/hooks/useOptimisticUpdates';

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
  const [nonEmptySessionIds, setNonEmptySessionIds] = useState<Set<string>>(
    new Set(sessions.map(s => s.session_id))
  );
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
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isDropdownOpen, setIsDropdownOpen] = useState<Set<string>>(new Set());
  const { optimisticMoveSession } = useOptimisticUpdates();

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


  const handleEditTitle = (sessionId: string) => {
    const session = sessions.find(s => s.session_id === sessionId);
    if (session) {
      startEdit(sessionId, session.title || session.session_id);
    }
  };

  const handleSaveTitle = async (sessionId: string) => {
    await saveTitle(sessionId);
  };

  const handleCancelEdit = () => {
    cancelEdit();
  };

  const handleMoveToFolder = async (sessionId: string, folderId: string | null) => {
    try {
      // Use optimistic update - UI updates immediately
      const result = await optimisticMoveSession(sessionId, folderId);

      if (!result.success) {
        console.error('Failed to move session:', result.error);
        // You could show a toast notification here
        return;
      }

      // Call the parent handler for any additional logic
      onMoveToFolder(sessionId, folderId);
    } catch (error) {
      console.error('Error moving session:', error);
      // Error handling is done in the optimistic update hook
    }
  };

  const handleCreateFolderWithSession = (sessionId: string) => {
    onCreateFolderWithSession(sessionId);
  };

  const toggleFolderSubmenu = (sessionId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
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
                    }`}
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
                        className="flex-1 min-w-0 text-left whitespace-nowrap overflow-hidden truncate group-hover:pr-3"
                        onMouseEnter={(e) => handleMouseEnter(session.session_id, e)}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                      >
                        {session?.title || session.session_id}
                      </span>
                    )}
                    {editingSessionId !== session.session_id && (
                      <Dropdown
                        placement="bottom-end"
                        className="min-w-48"
                        shouldBlockScroll={false}
                        isOpen={isDropdownOpen.has(session.session_id)}
                        onOpenChange={(open) => {
                          if (open) {
                            setIsDropdownOpen(prev => new Set(prev).add(session.session_id));
                          } else {
                            setIsDropdownOpen(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(session.session_id);
                              return newSet;
                            });
                          }
                        }}
                      >
                        <DropdownTrigger>
                          <div
                            className={`-mr-1 opacity-100 xl:opacity-0 xl:group-hover:opacity-100 rotate-90 transition-opacity duration-150 shrink-0 ${activeSessionId === session.session_id ? 'text-secondary' : 'text-neutral-9'
                              } font-semibold md:!text-[1rem] xl:!text-[1.125rem] min-w-6 h-6`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            ⋯
                          </div>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Session actions" closeOnSelect={false} items={[
                          { key: 'edit-title', label: 'Edit title', icon: null, hasArrow: false, indent: false },
                          { key: 'add-to-folder', label: 'Add to folder', icon: <FolderHeart />, hasArrow: true, indent: false },
                          ...(expandedFolders.has(session.session_id) ? [
                            ...folders.map(folder => ({
                              key: `folder-${folder.folder_id}`,
                              label: folder.folder_name,
                              icon: <FolderHeart />,
                              indent: true,
                              hasArrow: false
                            })),
                            { key: 'create-folder', label: 'Create new folder', icon: <Folder size={20} />, indent: true, hasArrow: false }
                          ] : [])
                        ]}>
                          {(item) => (
                            <DropdownItem
                              key={item.key}
                              onPress={() => {
                                if (item.key === 'edit-title') {
                                  handleEditTitle(session.session_id);
                                  setIsDropdownOpen(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(session.session_id);
                                    return newSet;
                                  });
                                } else if (item.key === 'add-to-folder') {
                                  toggleFolderSubmenu(session.session_id);
                                  // Không đóng dropdown khi click Add to folder
                                } else if (item.key === 'create-folder') {
                                  handleCreateFolderWithSession(session.session_id);
                                  setIsDropdownOpen(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(session.session_id);
                                    return newSet;
                                  });
                                } else if (item.key.startsWith('folder-')) {
                                  const folderId = item.key.replace('folder-', '');
                                  handleMoveToFolder(session.session_id, folderId);
                                  setIsDropdownOpen(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(session.session_id);
                                    return newSet;
                                  });
                                }
                              }}
                              startContent={item.icon}
                              endContent={item.hasArrow ? (
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
                                  className={`transition-transform ${expandedFolders.has(session.session_id) ? 'rotate-90' : ''}`}
                                >
                                  <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                              ) : null}
                              className={`font-semibold ${item.key === 'create-folder' ? 'text-primary' : 'text-neutral-9'} ${item.indent ? 'pl-6' : ''}`}
                            >
                              {item.label}
                            </DropdownItem>
                          )}
                        </DropdownMenu>
                      </Dropdown>
                    )}
                  </div>
                </Button>

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