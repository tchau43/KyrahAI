// src/features/chat/components/ChatSidebar.tsx
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import ChatSidebarHeader from './ChatSidebarHeader';
import ChatHistory from './ChatHistory';
import ChatSidebarFooter from './ChatSidebarFooter';
import { useAuth } from '@/contexts/AuthContext';
import { Session } from '@/types/auth.types';
import { XIcon } from '@/components/icons';
import { useModalStore } from '@/store/useModalStore';
import FolderModal from '@/components/modals/FolderModal';
import AddSessionsToFolderModal from '@/components/modals/AddSessionsToFolderModal';
import FolderList from '@/components/chat/FolderList';
import { createClient } from '@/utils/supabase/client';
import { useGetFolders } from '@/features/chat/hooks/useGetFolders';
import { useOptimisticUpdates } from '@/features/chat/hooks/useOptimisticUpdates';

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
  const [sessionIdToMove, setSessionIdToMove] = useState<string | undefined>();
  const [addSessionsModalData, setAddSessionsModalData] = useState({
    folderId: '',
    folderName: '',
    availableSessions: [] as Session[]
  });

  const { openModal } = useModalStore();
  const { data: folders = [] } = useGetFolders();
  const {
    optimisticRenameFolder,
    optimisticMoveSession,
    optimisticDeleteFolder
  } = useOptimisticUpdates();

  // Auth state management
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setHasUser(!!data.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setHasUser(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Memoize sessions by folder
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

    // Sort sessions by last activity
    map.forEach((sessionList) => {
      sessionList.sort((a, b) =>
        new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime()
      );
    });

    return map;
  }, [sessions]);

  // Memoize uncategorized sessions
  const uncategorizedSessions = useMemo(
    () => sessions.filter((session) => !session.folder_id),
    [sessions]
  );

  // Handlers with useCallback
  const handleToggleFolder = useCallback((folderId: string) => {
    setExpandedFolderIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  const handleOpenCreateFolderModal = useCallback((sessionId?: string) => {
    setSessionIdToMove(sessionId);
    openModal('folder-modal');
  }, [openModal]);

  const handleDeleteFolder = useCallback(async (folderId: string) => {
    // Update local UI state
    setExpandedFolderIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(folderId);
      return newSet;
    });

    const result = await optimisticDeleteFolder(folderId);

    if (!result.success) {
      console.error('Failed to delete folder:', result.error);
      // TODO: Show toast notification
    }
    // ❌ REMOVED: No need to invalidate
  }, [optimisticDeleteFolder]);

  const handleAddSessionsToFolder = useCallback((
    folderId: string,
    folderName: string,
    availableSessions: Session[]
  ) => {
    setAddSessionsModalData({ folderId, folderName, availableSessions });
    openModal('add-sessions-to-folder-modal');
  }, [openModal]);

  if (!hasUser) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 pointer-events-auto xl:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed xl:relative inset-y-0 left-0 z-50 bg-neutral flex flex-col border-r border-neutral-2 
          transition-all duration-300 xl:transition-[width] xl:duration-300 xl:overflow-x-hidden
          ${isCollapsed ? 'xl:w-16' : 'w-72 xl:w-72'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
        `}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 xl:hidden p-2 rounded-full hover:bg-neutral-2 transition-colors z-10"
          aria-label="Close sidebar"
        >
          <XIcon size={20} className="text-neutral-9" />
        </button>

        {/* Header - always render */}
        <ChatSidebarHeader
          isCollapsed={isCollapsed}
          onNewChat={onNewChat}
          onNewFolder={() => handleOpenCreateFolderModal()}
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Content - hide when collapsed */}
        {!isCollapsed && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-2">
                {/* Loading skeleton */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-neutral-2 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4 p-2">
                {/* Folders section */}
                {folders.length > 0 && (
                  <div>
                    <button
                      onClick={() => setIsFoldersCollapsed(!isFoldersCollapsed)}
                      className="w-full flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-neutral-3 rounded-lg transition-colors mb-2"
                      aria-expanded={!isFoldersCollapsed}
                    >
                      <div className="text-[14px] font-semibold text-neutral-9 uppercase tracking-normal">
                        Folders
                      </div>
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
                        className={`transition-transform text-neutral-6 ${isFoldersCollapsed ? 'rotate-180' : ''
                          }`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {!isFoldersCollapsed && (
                      <FolderList
                        folders={folders}
                        onRenameFolder={optimisticRenameFolder}
                        onDeleteFolder={handleDeleteFolder}
                        onToggleFolder={handleToggleFolder}
                        sessionsInFolder={sessionsByFolder}
                        activeSessionId={activeSessionId}
                        onSelectSession={onSelectSession}
                        expandedFolderIds={expandedFolderIds}
                        onMoveToFolder={optimisticMoveSession}
                        onCreateFolderWithSession={handleOpenCreateFolderModal}
                        onAddSessionsToFolder={handleAddSessionsToFolder}
                        availableSessions={sessions}
                      />
                    )}
                  </div>
                )}

                {/* Chat History section */}
                <div>
                  <button
                    onClick={() => setIsChatHistoryCollapsed(!isChatHistoryCollapsed)}
                    className="w-full flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-neutral-3 rounded-lg transition-colors mb-2"
                    aria-expanded={!isChatHistoryCollapsed}
                  >
                    <div className="text-[14px] font-semibold text-neutral-9 uppercase tracking-normal">
                      Chat History
                    </div>
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
                      className={`transition-transform text-neutral-6 ${isChatHistoryCollapsed ? 'rotate-180' : ''
                        }`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {!isChatHistoryCollapsed && (
                    <ChatHistory
                      sessions={uncategorizedSessions}
                      activeSessionId={activeSessionId}
                      onSelectSession={onSelectSession}
                      folders={folders}
                      onMoveToFolder={optimisticMoveSession}
                      onCreateFolderWithSession={handleOpenCreateFolderModal}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Spacer when collapsed */}
        {isCollapsed && <div className="flex-1" />}

        <ChatSidebarFooter isCollapsed={isCollapsed} />
      </aside>

      {/* Modals */}
      <FolderModal sessionIdToMove={sessionIdToMove} />
      <AddSessionsToFolderModal {...addSessionsModalData} />
    </>
  );
}