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
  getFolders,
  moveSessionToFolder,
  deleteFolder,
  FolderWithCount
} from '@/lib/chat';
import FolderModal from '@/components/modals/FolderModal';
import FolderList from '@/components/chat/FolderList';
import { createClient } from '@/utils/supabase/client';

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
  const [folders, setFolders] = useState<FolderWithCount[]>([]);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());

  // Modal states
  const { openModal } = useModalStore();
  const [folderModalMode, setFolderModalMode] = useState<'create' | 'rename'>('create');
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
  const [selectedFolderName, setSelectedFolderName] = useState('');
  const [sessionIdToMove, setSessionIdToMove] = useState<string | undefined>();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setHasUser(!!data.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setHasUser(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load folders
  useEffect(() => {
    if (hasUser) {
      loadFolders();
    }
  }, [hasUser]);

  const loadFolders = async () => {
    const foldersData = await getFolders();
    setFolders(foldersData);
  };

  // Tính toán sessions trong mỗi folder từ sessions prop (không cần fetch lại)
  const sessionsByFolder = useMemo(() => {
    const map = new Map<string, Session[]>();

    sessions.forEach(session => {
      if (session.folder_id) {
        if (!map.has(session.folder_id)) {
          map.set(session.folder_id, []);
        }
        map.get(session.folder_id)!.push(session);
      }
    });

    // Sort sessions by last_activity_at
    map.forEach((sessionList) => {
      sessionList.sort((a, b) =>
        new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime()
      );
    });

    return map;
  }, [sessions]);

  const handleToggleFolder = (folderId: string) => {
    setExpandedFolderIds(prev => {
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
    setFolderModalMode('create');
    setSelectedFolderId(undefined);
    setSelectedFolderName('');
    setSessionIdToMove(sessionId);
    openModal('folder-modal');
  };

  const handleOpenRenameFolderModal = (folderId: string, currentName: string) => {
    setFolderModalMode('rename');
    setSelectedFolderId(folderId);
    setSelectedFolderName(currentName);
    setSessionIdToMove(undefined);
    openModal('folder-modal');
  };

  const handleFolderModalSuccess = () => {
    loadFolders();
  };

  const handleMoveToFolder = async (sessionId: string, folderId: string | null) => {
    const success = await moveSessionToFolder(sessionId, folderId);
    if (success) {
      // Refresh folders to update counts
      loadFolders();
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const success = await deleteFolder(folderId);
    if (success) {
      // Remove from expanded folders
      setExpandedFolderIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(folderId);
        return newSet;
      });
      loadFolders();
    }
  };

  const handleEditTitle = (sessionId: string) => {
    // TODO: Implement edit title functionality
    console.log('Edit title for session:', sessionId);
  };

  // Get uncategorized sessions (sessions without folder_id)
  const uncategorizedSessions = sessions.filter(session => !session.folder_id);

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
          transition-all duration-300
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

        <div className={isCollapsed ? 'hidden xl:hidden' : ''}>
          <ChatSidebarHeader
            onNewChat={onNewChat}
            onNewFolder={() => handleOpenCreateFolderModal()}
            onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
            showCollapseButton={true}
          />
        </div>

        {isCollapsed && (
          <div className="p-4">
            <div className="flex items-center justify-center mb-10 relative">
              <Button
                isIconOnly
                variant="light"
                className="hidden xl:flex"
                onPress={() => setIsCollapsed(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="rotate-180"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
              </Button>
            </div>
          </div>
        )}

        <div className={isCollapsed ? 'hidden xl:hidden flex-1 min-h-0' : 'flex-1 min-h-0 overflow-y-auto'}>
          {isLoading ? (
            <div className="flex flex-col h-full">
              <div className="text-xs font-semibold text-neutral-9 px-3 py-2 uppercase tracking-normal flex-shrink-0">
                Sessions
              </div>
              <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-0">
                <div className="space-y-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="w-full justify-start px-3 py-3 h-auto bg-transparent"
                    >
                      <div className="h-4 bg-neutral-3 rounded animate-pulse w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Folders Section */}
              {folders.length > 0 && (
                <>
                  {folders.map(folder => {
                    const sessionsInFolder = sessionsByFolder.get(folder.folder_id) || [];
                    const isExpanded = expandedFolderIds.has(folder.folder_id);

                    return (
                      <FolderList
                        key={folder.folder_id}
                        folders={[folder]}
                        onSelectFolder={handleToggleFolder}
                        onRenameFolder={handleOpenRenameFolderModal}
                        onDeleteFolder={handleDeleteFolder}
                        expandedFolderId={isExpanded ? folder.folder_id : null}
                        onToggleFolder={handleToggleFolder}
                        sessionsInFolder={sessionsInFolder}
                        activeSessionId={activeSessionId}
                        onSelectSession={onSelectSession}
                      />
                    );
                  })}
                </>
              )}

              {/* Uncategorized Sessions */}
              <ChatHistory
                sessions={uncategorizedSessions}
                activeSessionId={activeSessionId}
                onSelectSession={onSelectSession}
                folders={folders}
                onMoveToFolder={handleMoveToFolder}
                onCreateFolderWithSession={handleOpenCreateFolderModal}
                onEditTitle={handleEditTitle}
              />
            </div>
          )}
        </div>

        {isCollapsed && <div className="flex-1" />}

        <ChatSidebarFooter isCollapsed={isCollapsed} />
      </aside>

      {/* Folder Modal */}
      <FolderModal
        mode={folderModalMode}
        folderId={selectedFolderId}
        initialName={selectedFolderName}
        sessionIdToMove={sessionIdToMove}
        onSuccess={handleFolderModalSuccess}
      />
    </>
  );
}