// src/components/chat/FolderList.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { FolderWithCount } from '@/lib/chat';
import { Session } from '@/types/auth.types';
import { Folder, FolderHeart, FolderX } from '../icons';
import { useSessionTitleEditor } from '@/features/chat/hooks/useSessionTitleEditor';
import { useModalStore } from '@/store/useModalStore';
import { useOptimisticUpdates } from '@/features/chat/hooks/useOptimisticUpdates';

interface FolderListProps {
  folders: FolderWithCount[];
  onRenameFolder: (folderId: string, currentName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onToggleFolder: (folderId: string) => void;
  sessionsInFolder: Map<string, Session[]>;
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  expandedFolderIds: Set<string>;
  onMoveToFolder: (sessionId: string, folderId: string | null) => void;
  onCreateFolderWithSession: (sessionId: string) => void;
  availableSessions: Session[];
}

export default function FolderList({
  folders,
  onRenameFolder,
  onDeleteFolder,
  onToggleFolder,
  sessionsInFolder,
  activeSessionId,
  onSelectSession,
  expandedFolderIds,
  onMoveToFolder,
  onCreateFolderWithSession,
  availableSessions,
}: FolderListProps) {
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState<Set<string>>(new Set());
  const [isSessionDropdownOpen, setIsSessionDropdownOpen] = useState<Set<string>>(new Set());
  const [expandedMoveToFolders, setExpandedMoveToFolders] = useState<Set<string>>(new Set());

  const folderInputRef = useRef<HTMLInputElement>(null);

  const { openModal } = useModalStore();
  const { optimisticRenameFolder, optimisticMoveSession } = useOptimisticUpdates();

  // Use custom hook for session title editing
  const {
    editingSessionId,
    editTitle,
    inputRef: sessionInputRef,
    setEditTitle,
    startEdit,
    saveTitle,
    cancelEdit,
  } = useSessionTitleEditor();

  useEffect(() => {
    if (editingFolderId && folderInputRef.current) {
      folderInputRef.current.focus();
      folderInputRef.current.select();
    }
  }, [editingFolderId]);

  const toggleMoveToFolderSubmenu = (sessionId: string) => {
    setExpandedMoveToFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };


  const handleEditFolderName = (folderId: string, currentName: string) => {
    setEditingFolderId(folderId);
    setEditFolderName(currentName);
    setIsFolderDropdownOpen(prev => {
      const newSet = new Set(prev);
      newSet.delete(folderId);
      return newSet;
    });
  };

  const handleSaveFolderName = async (folderId: string) => {
    if (editFolderName.trim()) {
      try {
        // Use optimistic update - UI updates immediately
        const result = await optimisticRenameFolder(folderId, editFolderName.trim());

        if (!result.success) {
          console.error('Failed to save folder name:', result.error);
          // You could show a toast notification here
          return;
        }

        // Call the parent handler for any additional logic
        onRenameFolder(folderId, editFolderName.trim());
      } catch (error) {
        console.error('Error saving folder name:', error);
        // Error handling is done in the optimistic update hook
      }
    }
    setEditingFolderId(null);
    setEditFolderName('');
  };

  const handleCancelEditFolder = () => {
    setEditingFolderId(null);
    setEditFolderName('');
  };

  // Handle session title editing
  const handleEditTitle = (sessionId: string, currentTitle: string) => {
    startEdit(sessionId, currentTitle);
    setIsSessionDropdownOpen(prev => {
      const newSet = new Set(prev);
      newSet.delete(sessionId);
      return newSet;
    });
  };

  const handleSaveTitle = async (sessionId: string) => {
    await saveTitle(sessionId);
  };

  const handleCancelEdit = () => {
    cancelEdit();
  };

  const handleMoveSession = async (sessionId: string, folderId: string | null) => {
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

    setIsSessionDropdownOpen(prev => {
      const newSet = new Set(prev);
      newSet.delete(sessionId);
      return newSet;
    });
  };

  const handleAddSessionsToFolder = (folderId: string, folderName: string) => {
    // Filter out sessions that are already in this folder
    const sessionsInThisFolder = sessionsInFolder.get(folderId) || [];
    const sessionIdsInFolder = new Set(sessionsInThisFolder.map(s => s.session_id));
    const availableSessionsForFolder = availableSessions.filter(s => !sessionIdsInFolder.has(s.session_id));

    // Store folder info for the modal
    (window as any).addSessionsToFolderData = {
      folderId,
      folderName,
      availableSessions: availableSessionsForFolder
    };

    openModal('add-sessions-to-folder-modal');
    setIsFolderDropdownOpen(prev => {
      const newSet = new Set(prev);
      newSet.delete(folderId);
      return newSet;
    });
  };

  return (
    <div className="px-2">
      {folders.map((folder) => {
        const isExpanded = expandedFolderIds.has(folder.folder_id);
        const sessions = sessionsInFolder.get(folder.folder_id) || [];

        return (
          <div key={folder.folder_id} className="mb-2">
            {/* Folder Header */}
            <div className="relative">
              <Button
                onPress={() => {
                  if (editingFolderId !== folder.folder_id) {
                    onToggleFolder(folder.folder_id)
                  }
                }}
                className="group w-full justify-start px-3 py-2 h-auto bg-transparent text-neutral-8 hover:bg-neutral-3 hover:text-neutral-9 transition-colors"
              >
                <div className="w-full flex items-center gap-2">
                  {/* Expand/Collapse Icon */}
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
                    className={`transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''
                      }`}
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>

                  {/* Folder Icon */}
                  <span className="flex-shrink-0"><FolderHeart /></span>

                  {/* Folder Name (editable) */}
                  {editingFolderId === folder.folder_id ? (
                    <input
                      ref={folderInputRef}
                      type="text"
                      value={editFolderName}
                      onChange={(e) => setEditFolderName(e.target.value)}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') {
                          handleSaveFolderName(folder.folder_id);
                        } else if (e.key === 'Escape') {
                          handleCancelEditFolder();
                        }
                      }}
                      onBlur={handleCancelEditFolder}
                      className="flex-1 min-w-0 text-neutral-9 px-2 py-1 rounded border border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    />
                  ) : (
                    <span className="flex-1 min-w-0 caption-14-semi text-left truncate">
                      {folder.folder_name}
                    </span>
                  )}

                  {/* Session Count */}
                  {/* <span className="text-xs text-neutral-6 flex-shrink-0 bg-neutral-2 w-5 h-5 rounded-full flex items-center justify-center">
                    {sessions.length}
                  </span> */}

                  {/* Dropdown Menu Button */}
                  {editingFolderId !== folder.folder_id && (
                    <Dropdown
                      placement="bottom-end"
                      className="min-w-48"
                      shouldBlockScroll={false}
                      isOpen={isFolderDropdownOpen.has(folder.folder_id)}
                      onOpenChange={(open) => {
                        if (open) {
                          setIsFolderDropdownOpen(prev => new Set(prev).add(folder.folder_id));
                        } else {
                          setIsFolderDropdownOpen(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(folder.folder_id);
                            return newSet;
                          });
                        }
                      }}
                    >
                      <DropdownTrigger>
                        <div
                          className="opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity duration-150 shrink-0 rotate-90 cursor-pointer rounded p-1 text-neutral-9 font-semibold md:!text-[1rem] xl:!text-[1.125rem] min-w-6 h-6"
                          onClick={(e) => e.stopPropagation()}
                        >
                          ⋯
                        </div>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Folder actions" closeOnSelect={false} items={[
                        { key: 'rename-folder', label: 'Rename folder', icon: null },
                        { key: 'add-chat', label: 'Add chat to folder', icon: null },
                        { key: 'delete-folder', label: 'Delete folder', icon: null }
                      ]}>
                        {(item) => (
                          <DropdownItem
                            key={item.key}
                            onPress={() => {
                              if (item.key === 'rename-folder') {
                                handleEditFolderName(folder.folder_id, folder.folder_name);
                              } else if (item.key === 'add-chat') {
                                handleAddSessionsToFolder(folder.folder_id, folder.folder_name);
                              } else if (item.key === 'delete-folder') {
                                onDeleteFolder(folder.folder_id);
                                setIsFolderDropdownOpen(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(folder.folder_id);
                                  return newSet;
                                });
                              }
                            }}
                            className={`font-semibold ${item.key === 'delete-folder' ? 'text-red-600' : 'text-neutral-9'}`}
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

            {/* Sessions inside folder */}
            {isExpanded && sessions.length > 0 && (
              <div className="ml-6 mt-1 space-y-1">
                {sessions.map((session) => (
                  <div key={session.session_id} className="relative">
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
                            ref={sessionInputRef}
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
                          <span className="flex-1 min-w-0 text-left whitespace-nowrap overflow-hidden truncate group-hover:pr-3">
                            {session?.title || session.session_id}
                          </span>
                        )}
                        {editingSessionId !== session.session_id && (
                          <Dropdown
                            placement="bottom-end"
                            className="min-w-52"
                            shouldBlockScroll={false}
                            isOpen={isSessionDropdownOpen.has(session.session_id)}
                            onOpenChange={(open) => {
                              if (open) {
                                setIsSessionDropdownOpen(prev => new Set(prev).add(session.session_id));
                              } else {
                                setIsSessionDropdownOpen(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(session.session_id);
                                  return newSet;
                                });
                              }
                            }}
                          >
                            <DropdownTrigger>
                              <div
                                className={`-mr-1 opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity duration-150 shrink-0 rotate-90 cursor-pointer rounded p-1 ${activeSessionId === session.session_id
                                  ? 'text-secondary'
                                  : 'text-neutral-9'
                                  } font-semibold md:!text-[1rem] xl:!text-[1.125rem] min-w-6 h-6`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                ⋯
                              </div>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Session actions" closeOnSelect={false} items={[
                              { key: 'rename', label: 'Rename', icon: null, hasArrow: false, indent: false },
                              { key: 'move-to-folder', label: 'Move to folder', icon: <FolderHeart />, hasArrow: true, indent: false },
                              ...(expandedMoveToFolders.has(session.session_id) ? [
                                ...folders.filter(f => f.folder_id !== folder.folder_id).map(f => ({
                                  key: `folder-${f.folder_id}`,
                                  label: f.folder_name,
                                  icon: <FolderHeart />,
                                  indent: true,
                                  hasArrow: false
                                })),
                                { key: 'create-folder', label: 'Create new folder', icon: <Folder size={20} />, indent: true, hasArrow: false }
                              ] : []),
                              { key: 'remove-from-folder', label: 'Remove from folder', icon: <FolderX />, hasArrow: false, indent: false }
                            ]}>
                              {(item) => (
                                <DropdownItem
                                  key={item.key}
                                  onPress={() => {
                                    if (item.key === 'rename') {
                                      handleEditTitle(session.session_id, session.title || session.session_id);
                                    } else if (item.key === 'move-to-folder') {
                                      toggleMoveToFolderSubmenu(session.session_id);
                                    } else if (item.key === 'create-folder') {
                                      onCreateFolderWithSession(session.session_id);
                                      setIsSessionDropdownOpen(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(session.session_id);
                                        return newSet;
                                      });
                                    } else if (item.key.startsWith('folder-')) {
                                      const folderId = item.key.replace('folder-', '');
                                      handleMoveSession(session.session_id, folderId);
                                    } else if (item.key === 'remove-from-folder') {
                                      handleMoveSession(session.session_id, null);
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
                                      className={`transition-transform ${expandedMoveToFolders.has(session.session_id) ? 'rotate-90' : ''}`}
                                    >
                                      <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                  ) : null}
                                  className={`font-semibold ${item.key === 'remove-from-folder' ? 'text-neutral-9' : 'text-neutral-9'} ${item.indent ? 'pl-6' : ''}`}
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
            )}
          </div>
        );
      })}
    </div>
  );
}