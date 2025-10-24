// src/features/chat/components/ChatSidebar.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@heroui/react';
import ChatSidebarHeader from './ChatSidebarHeader';
import ChatHistory from './ChatHistory';
import ChatSidebarFooter from './ChatSidebarFooter';
import { useAuth } from '@/contexts/AuthContext';
import { Session } from '@/types/auth.types';
import { XIcon } from '@/components/icons';
import { useModalStore } from '@/store/useModalStore';
import {
  moveSessionToFolder,
  deleteFolder,
  renameFolder,
} from '@/lib/chat';
import FolderModal from '@/components/modals/FolderModal';
import AddSessionsToFolderModal from '@/components/modals/AddSessionsToFolderModal';
import FolderList from '@/components/chat/FolderList';
import { createClient } from '@/utils/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useGetFolders } from '@/features/chat/hooks/useGetFolders';

interface ChatSidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export default function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  isOpen,
  onClose,
  isLoading = false,
}: ChatSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasUser, setHasUser] = useState(false);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());
  const [isFoldersCollapsed, setIsFoldersCollapsed] = useState(false);
  const [isChatHistoryCollapsed, setIsChatHistoryCollapsed] = useState(false);

  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Use custom hook to fetch folders
  const { data: folders = [] } = useGetFolders();

  // Modal states
  const { openModal } = useModalStore();
  const [sessionIdToMove, setSessionIdToMove] = useState<string | undefined>();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setHasUser(!!data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setHasUser(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const sessionsByFolder = useMemo(() => {
    const map = new Map<string, Session[]>();
    sessions.forEach((session) => {
      if (session.folder_id) {
        if (!map.has(session.folder_id)) {
          map.set(session.folder_id, []);
        }
        map.get(session.folder_id)!.push(session);
      }
    });
    map.forEach((sessionList) => {
      sessionList.sort(
        (a, b) =>
          new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime()
      );
    });
    return map;
  }, [sessions]);

  const handleToggleFolder = (folderId: string) => {
    setExpandedFolderIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleOpenCreateFolderModal = (sessionId?: string) => {
    setSessionIdToMove(sessionId);
    openModal('folder-modal');
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    const success = await renameFolder(folderId, newName);
    if (success) {
      await queryClient.invalidateQueries({ queryKey: ['user-folders', user?.id] });
    }
  };

  const handleMoveToFolder = async (sessionId: string, folderId: string | null) => {
    const success = await moveSessionToFolder(sessionId, folderId);
    if (success) {
      // Invalidate both folders and sessions
      await queryClient.invalidateQueries({ queryKey: ['user-folders', user?.id] });
      await queryClient.invalidateQueries({ queryKey: ['user-sessions', user?.id] });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const success = await deleteFolder(folderId);
    if (success) {
      setExpandedFolderIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(folderId);
        return newSet;
      });
      // Invalidate both folders and sessions
      await queryClient.invalidateQueries({ queryKey: ['user-folders', user?.id] });
      await queryClient.invalidateQueries({ queryKey: ['user-sessions', user?.id] });
    }
  };

  const uncategorizedSessions = sessions.filter((session) => !session.folder_id);

  if (!hasUser) return null;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 pointer-events-auto xl:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`
          fixed xl:relative inset-y-0 left-0 z-50 bg-neutral flex flex-col border-r border-neutral-2 
          transition-all duration-300 xl:transition-[width] xl:duration-300 xl:overflow-x-hidden
          ${isCollapsed ? 'xl:w-16' : 'w-72 xl:w-72'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
        `}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 xl:hidden p-2 rounded-full hover:bg-neutral-2 transition-colors z-10"
          aria-label="Close sidebar"
        >
          <XIcon size={20} className="text-neutral-9" />
        </button>

        {/* FIX: Render header unconditionally and pass isCollapsed.
          Remove 'isCollapsed ? 'hidden xl:hidden' : ''
        */}
        <ChatSidebarHeader
          isCollapsed={isCollapsed}
          onNewChat={onNewChat}
          onNewFolder={() => handleOpenCreateFolderModal()}
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />


        <div
          className={`${isCollapsed ? 'hidden xl:hidden flex-1 min-h-0' : 'flex-1 min-h-0 overflow-y-auto'}`}
        >
          {isLoading ? (
            // ... Loading skeleton ...
            <></>
          ) : (
            <div className="space-y-4 p-2">
              {folders.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-neutral-3 rounded-lg transition-colors" onClick={() => setIsFoldersCollapsed(!isFoldersCollapsed)}>
                    <div className="text-xs font-semibold text-neutral-9 uppercase tracking-normal">
                      Folders
                    </div>
                    <button
                      className="p-1 rounded transition-colors"
                      aria-label={isFoldersCollapsed ? "Expand folders" : "Collapse folders"}
                    >
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
                        className={`transition-transform text-neutral-6 ${isFoldersCollapsed ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  </div>
                  {!isFoldersCollapsed && (
                    <FolderList
                      folders={folders}
                      onRenameFolder={handleRenameFolder}
                      onDeleteFolder={handleDeleteFolder}
                      onToggleFolder={handleToggleFolder}
                      sessionsInFolder={sessionsByFolder}
                      activeSessionId={activeSessionId}
                      onSelectSession={onSelectSession}
                      expandedFolderIds={expandedFolderIds}
                      onMoveToFolder={handleMoveToFolder}
                      onCreateFolderWithSession={handleOpenCreateFolderModal}
                      availableSessions={sessions}
                    />
                  )}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-neutral-3 rounded-lg transition-colors" onClick={() => setIsChatHistoryCollapsed(!isChatHistoryCollapsed)}>
                  <div className="text-xs font-semibold text-neutral-9 uppercase tracking-normal">
                    Chat History
                  </div>
                  <button
                    className="p-1 rounded"
                    aria-label={isChatHistoryCollapsed ? "Expand chat history" : "Collapse chat history"}
                  >
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
                      className={`transition-transform text-neutral-6 ${isChatHistoryCollapsed ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>
                {!isChatHistoryCollapsed && (
                  <ChatHistory
                    sessions={uncategorizedSessions}
                    activeSessionId={activeSessionId}
                    onSelectSession={onSelectSession}
                    folders={folders}
                    onMoveToFolder={handleMoveToFolder}
                    onCreateFolderWithSession={handleOpenCreateFolderModal}
                  />
                )}
              </div>
            </div>
          )}
        </div>






        {isCollapsed && <div className="flex-1" />}

        <ChatSidebarFooter isCollapsed={isCollapsed} />
      </aside>

      {/* Folder Modal */}
      <FolderModal sessionIdToMove={sessionIdToMove} />

      {/* Add Sessions to Folder Modal */}
      <AddSessionsToFolderModal
        folderId={(window as any).addSessionsToFolderData?.folderId || ''}
        folderName={(window as any).addSessionsToFolderData?.folderName || ''}
        availableSessions={(window as any).addSessionsToFolderData?.availableSessions || []}
      />
    </>
  );
}