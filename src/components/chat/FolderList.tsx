// src/features/chat/components/FolderList.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@heroui/react';
import { Session } from '@/types/auth.types';
import { FolderWithCount } from '@/lib/chat';

interface FolderListProps {
  folders: FolderWithCount[];
  onSelectFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string, currentName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  expandedFolderId: string | null;
  onToggleFolder: (folderId: string) => void;
  sessionsInFolder: Session[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
}

export default function FolderList({
  folders,
  onSelectFolder,
  onRenameFolder,
  onDeleteFolder,
  expandedFolderId,
  onToggleFolder,
  sessionsInFolder,
  activeSessionId,
  onSelectSession,
}: FolderListProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleDropdownToggle = (folderId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenDropdownId(openDropdownId === folderId ? null : folderId);
  };

  if (folders.length === 0) return null;

  return (
    <div className="flex flex-col">
      <div className="text-xs font-semibold text-neutral-9 px-3 py-2 uppercase tracking-normal">
        Folders
      </div>
      <div className="px-2 space-y-1">
        {folders.map((folder) => (
          <div key={folder.folder_id}>
            {/* Folder Header */}
            <div className="relative">
              <Button
                onPress={() => onToggleFolder(folder.folder_id)}
                className="group w-full justify-start px-3 py-2 h-auto bg-transparent text-neutral-8 hover:bg-neutral-3 hover:text-neutral-9 transition-colors"
              >
                <div className="w-full flex items-center gap-2">
                  {/* Arrow Icon */}
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
                    className={`shrink-0 transition-transform ${expandedFolderId === folder.folder_id ? 'rotate-90' : ''
                      }`}
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>

                  {/* Folder Name */}
                  <span className="flex-1 min-w-0 text-left truncate">
                    {folder.folder_name}
                  </span>

                  {/* Session Count */}
                  {folder.session_count > 0 && (
                    <span className="text-xs text-neutral-7 shrink-0">
                      {folder.session_count}
                    </span>
                  )}

                  {/* Dropdown Menu */}
                  <div
                    onClick={(e) => handleDropdownToggle(folder.folder_id, e)}
                    className="-mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 rotate-90 cursor-pointer hover:bg-neutral-4 rounded p-1 text-neutral-9 font-semibold"
                  >
                    ...
                  </div>
                </div>
              </Button>

              {/* Dropdown Menu */}
              {openDropdownId === folder.folder_id && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-1 w-40 bg-white text-neutral-8 border border-neutral-3 rounded-lg shadow-lg z-50 py-2"
                >
                  <button
                    onClick={() => {
                      onRenameFolder(folder.folder_id, folder.folder_name);
                      setOpenDropdownId(null);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-neutral-2 transition-colors"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this folder?')) {
                        onDeleteFolder(folder.folder_id);
                      }
                      setOpenDropdownId(null);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-neutral-2 text-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Sessions in Folder */}
            {expandedFolderId === folder.folder_id && (
              <div className="ml-6 mt-1 space-y-1">
                {sessionsInFolder.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-neutral-7">
                    No sessions
                  </div>
                ) : (
                  sessionsInFolder.map((session) => (
                    <Button
                      key={session.session_id}
                      onPress={() => onSelectSession(session.session_id)}
                      className={`w-full justify-start px-3 py-2 h-auto transition-colors text-sm ${activeSessionId === session.session_id
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-transparent text-neutral-8 hover:bg-neutral-3 hover:text-neutral-9'
                        }`}
                    >
                      <span className="truncate text-left w-full">
                        {session?.title || session.session_id}
                      </span>
                    </Button>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}