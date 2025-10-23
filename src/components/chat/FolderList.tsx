// src/components/chat/FolderList.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@heroui/react';
import { FolderWithCount } from '@/lib/chat';
import { Session } from '@/types/auth.types';
// SỬA LỖI 3: Thêm imports
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { Folder, FolderHeart, FolderX } from '../icons';

interface FolderListProps {
  folders: FolderWithCount[];
  onSelectFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string, currentName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  expandedFolderId: string | null;
  onToggleFolder: (folderId: string) => void;
  sessionsInFolder: Map<string, Session[]>;
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  expandedFolderIds: Set<string>;
  onMoveToFolder: (sessionId: string, folderId: string | null) => void;
  onCreateFolderWithSession: (sessionId: string) => void; // <-- SỬA LỖI 3: Thêm prop
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
}: FolderListProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [sessionDropdownId, setSessionDropdownId] = useState<string | null>(null);

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [showFolderSubmenu, setShowFolderSubmenu] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const sessionDropdownRef = useRef<HTMLDivElement>(null);
  const sessionInputRef = useRef<HTMLInputElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (openDropdownId && dropdownRef.current && !dropdownRef.current.contains(target)) {
        setOpenDropdownId(null);
      }

      const outsideSessionDropdown = !sessionDropdownRef.current || !sessionDropdownRef.current.contains(target);
      const outsideSubmenu = !submenuRef.current || !submenuRef.current.contains(target);

      if ((sessionDropdownId || showFolderSubmenu) && outsideSessionDropdown && outsideSubmenu) {
        setSessionDropdownId(null);
        setShowFolderSubmenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId, sessionDropdownId, showFolderSubmenu]);

  useEffect(() => {
    if (editingFolderId && folderInputRef.current) {
      folderInputRef.current.focus();
      folderInputRef.current.select();
    }
  }, [editingFolderId]);

  useEffect(() => {
    if (editingSessionId && sessionInputRef.current) {
      sessionInputRef.current.focus();
      sessionInputRef.current.select();
    }
  }, [editingSessionId]);

  const handleFolderDropdownToggle = (folderId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenDropdownId(openDropdownId === folderId ? null : folderId);
    setSessionDropdownId(null);
    setShowFolderSubmenu(null);
  };

  const handleSessionDropdownToggle = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSessionDropdownId(sessionDropdownId === sessionId ? null : sessionId);
    setOpenDropdownId(null);
    setShowFolderSubmenu(null);
  };

  const handleEditFolderName = (folderId: string, currentName: string) => {
    setEditingFolderId(folderId);
    setEditFolderName(currentName);
    setOpenDropdownId(null);
  };

  const handleSaveFolderName = (folderId: string) => {
    if (editFolderName.trim()) {
      onRenameFolder(folderId, editFolderName.trim()); // Đây là prop đã sửa ở ChatSidebar
    }
    setEditingFolderId(null);
    setEditFolderName('');
  };

  const handleCancelEditFolder = () => {
    setEditingFolderId(null);
    setEditFolderName('');
  };

  // SỬA LỖI 3: Thêm các hàm xử lý session (copy từ ChatHistory)
  const handleEditTitle = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditTitle(currentTitle);
    setSessionDropdownId(null);
  };

  const handleSaveTitle = async (sessionId: string) => {
    if (!editTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('sessions')
        .update({ title: editTitle.trim() })
        .eq('session_id', sessionId);

      await queryClient.invalidateQueries({ queryKey: ['user-sessions', user?.id || ''] });

      if (error) console.error('Error updating title:', error);
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

  const handleToggleFolderSubmenu = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setShowFolderSubmenu(showFolderSubmenu === sessionId ? null : sessionId);
  };

  const handleMoveSession = (sessionId: string, folderId: string | null) => {
    onMoveToFolder(sessionId, folderId);
    setSessionDropdownId(null);
    setShowFolderSubmenu(null);
  };

  return (
    // SỬA LỖI 4: Thêm tiêu đề "Folders" và cấu trúc div
    <div>
      <div className="text-xs font-semibold text-neutral-9 px-3 py-2 uppercase tracking-normal flex-shrink-0">
        Folders
      </div>
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
                    <span className="text-xs text-neutral-6 flex-shrink-0">
                      ({sessions.length})
                    </span>

                    {/* Dropdown Menu Button */}
                    <div
                      role="button"
                      tabIndex={0}
                      aria-haspopup="menu"
                      aria-expanded={openDropdownId === folder.folder_id}
                      aria-controls={`folder-menu-${folder.folder_id}`}
                      onClick={(e) => handleFolderDropdownToggle(folder.folder_id, e)}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 rotate-90 cursor-pointer hover:bg-neutral-4 rounded p-1 text-neutral-9 font-semibold md:!text-[1rem] xl:!text-[1.125rem]"
                    >
                      ...
                    </div>
                  </div>
                </Button>

                {/* Folder Dropdown Menu */}
                {openDropdownId === folder.folder_id && !editingFolderId && (
                  <div
                    id={`folder-menu-${folder.folder_id}`}
                    ref={dropdownRef}
                    className="absolute right-2 top-full mt-1 w-48 bg-white text-neutral-8 border border-neutral-3 rounded-lg shadow-lg z-[60] py-2"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFolderName(folder.folder_id, folder.folder_name);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-neutral-2 transition-colors"
                    >
                      Rename folder
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm(
                            `Delete folder "${folder.folder_name}"? Sessions will be moved to uncategorized.`
                          )
                        ) {
                          onDeleteFolder(folder.folder_id);
                        }
                        setOpenDropdownId(null);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-neutral-2 transition-colors text-red-600"
                    >
                      Delete folder
                    </button>
                  </div>
                )}
              </div>

              {/* Sessions inside folder */}
              {isExpanded && sessions.length > 0 && (
                <div className="ml-6 mt-1 space-y-1">
                  {sessions.map((session) => (
                    <div key={session.session_id} className="relative">
                      <Button
                        onPress={() => {
                          // SỬA LỖI 3: Thêm kiểm tra
                          if (editingSessionId !== session.session_id) {
                            onSelectSession(session.session_id);
                          }
                        }}
                        className={`group w-full justify-start px-3 py-2 h-auto transition-colors ${activeSessionId === session.session_id
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'bg-transparent text-neutral-8 hover:bg-neutral-3 hover:text-neutral-9'
                          }`}
                      >
                        <div className="w-full flex items-center gap-1">
                          {/* SỬA LỖI 3: Thêm input đổi tên session */}
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
                            <span className="flex-1 min-w-0 text-left whitespace-nowrap overflow-visible group-hover:overflow-hidden group-hover:truncate group-hover:pr-3">
                              {session?.title || session.session_id}
                            </span>
                          )}
                          <div
                            role="button"
                            tabIndex={0}
                            aria-haspopup="menu"
                            aria-expanded={sessionDropdownId === session.session_id}
                            aria-controls={`session-menu-${session.session_id}`}
                            onClick={(e) => handleSessionDropdownToggle(session.session_id, e)}
                            onPointerDown={(e) => e.stopPropagation()}
                            className={`-mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 rotate-90 cursor-pointer hover:bg-white/10 rounded p-1 ${activeSessionId === session.session_id
                              ? 'text-neutral-1'
                              : 'text-neutral-9'
                              } font-semibold md:!text-[1rem] xl:!text-[1.125rem]`}
                          >
                            ...
                          </div>
                        </div>
                      </Button>

                      {/* SỬA LỖI 3: Thêm dropdown đầy đủ cho session */}
                      {sessionDropdownId === session.session_id && !editingSessionId && (
                        <div
                          id={`session-menu-${session.session_id}`}
                          ref={sessionDropdownRef}
                          className="absolute right-2 top-full mt-1 w-52 bg-white text-neutral-8 border border-neutral-3 rounded-lg shadow-lg z-[70] py-2"
                        >
                          {/* Rename */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTitle(
                                session.session_id,
                                session.title || session.session_id
                              );
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-neutral-2 transition-colors"
                          >
                            Rename
                          </button>

                          {/* Move to folder (submenu) */}
                          <div className="relative">
                            <button
                              onClick={(e) =>
                                handleToggleFolderSubmenu(session.session_id, e)
                              }
                              className="w-full px-4 py-2 text-left hover:bg-neutral-2 transition-colors flex items-center justify-between"
                            >
                              <span>Move to folder</span>
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
                                className={`transition-transform ${showFolderSubmenu === session.session_id
                                  ? 'rotate-90'
                                  : ''
                                  }`}
                              >
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            </button>

                            {/* Folder Submenu */}
                            {showFolderSubmenu === session.session_id && (
                              <div
                                ref={submenuRef}
                                className="absolute left-0 top-full mt-1 w-full bg-white border border-neutral-3 rounded-lg shadow-lg z-[80] py-2 max-h-60 overflow-y-auto"
                              >
                                {/* Lọc ra folder hiện tại */}
                                <div className="max-h-40 overflow-y-auto">
                                  {folders.filter(f => f.folder_id !== folder.folder_id).length > 0 ? (
                                    folders
                                      .filter(f => f.folder_id !== folder.folder_id)
                                      .map((f) => (
                                        <button
                                          key={f.folder_id}
                                          onClick={() =>
                                            handleMoveSession(session.session_id, f.folder_id)
                                          }
                                          className="flex gap-2 w-full px-4 py-2 text-left hover:bg-neutral-2 transition-colors text-sm truncate"
                                        >
                                          <FolderHeart /> {f.folder_name}
                                        </button>
                                      ))
                                  ) : (
                                    <div className="px-4 py-2 text-sm text-neutral-7">
                                      No other folders
                                    </div>
                                  )}
                                </div>

                                {/* Create new folder */}
                                <div className="border-t border-neutral-3 my-1" />
                                <button
                                  onClick={() => {
                                    onCreateFolderWithSession(session.session_id);
                                    setSessionDropdownId(null);
                                    setShowFolderSubmenu(null);
                                  }}
                                  className="flex gap-2 w-full px-4 py-2 text-left hover:bg-neutral-2 transition-colors text-sm text-neutral-9 font-medium"
                                >
                                  <Folder size={20} /> Create new folder
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="border-t border-neutral-3 my-1" />

                          {/* Remove from folder */}
                          <button
                            onClick={() => {
                              handleMoveSession(session.session_id, null);
                            }}
                            className="flex gap-2 w-full px-4 py-2 text-left hover:bg-neutral-2 transition-colors text-neutral-9"
                          >
                            <FolderX /> Remove from folder
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}