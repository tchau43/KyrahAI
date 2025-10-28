// src/features/chat/hooks/useOptimisticUpdates.ts
import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Session } from '@/types/auth.types';
import { FolderWithCount } from '@/lib/chat';
import { renameFolder, deleteFolder, moveSessionToFolder } from '@/lib/chat';
import { createClient } from '@/utils/supabase/client';

interface OptimisticUpdateResult {
  success: boolean;
  error?: string;
}

export function useOptimisticUpdates() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Track pending operations to prevent race conditions
  const pendingOpsRef = useRef(new Set<string>());

  // Snapshot helper - captures current state atomically
  const captureSnapshot = useCallback(() => {
    const sessions = queryClient.getQueryData<Session[]>(['user-sessions', user?.id]) || [];
    const folders = queryClient.getQueryData<FolderWithCount[]>(['user-folders', user?.id]) || [];
    return {
      sessions: structuredClone(sessions),
      folders: structuredClone(folders)
    };
  }, [queryClient, user?.id]);

  // Generic rollback function
  const rollback = useCallback((snapshot: ReturnType<typeof captureSnapshot>) => {
    queryClient.setQueryData(['user-sessions', user?.id], snapshot.sessions);
    queryClient.setQueryData(['user-folders', user?.id], snapshot.folders);
  }, [queryClient, user?.id]);

  // Optimistic rename session with deduplication
  const optimisticRenameSession = useCallback(async (
    sessionId: string,
    newTitle: string
  ): Promise<OptimisticUpdateResult> => {
    if (!user?.id) return { success: false, error: 'User not authenticated' };

    const operationKey = `rename-session-${sessionId}`;
    if (pendingOpsRef.current.has(operationKey)) {
      return { success: false, error: 'Operation already in progress' };
    }

    const snapshot = captureSnapshot();
    pendingOpsRef.current.add(operationKey);

    try {
      // Optimistic update
      const updatedSessions = snapshot.sessions.map(session =>
        session.session_id === sessionId
          ? { ...session, title: newTitle }
          : session
      );

      queryClient.setQueryData(['user-sessions', user.id], updatedSessions);

      // Database update
      const supabase = createClient();
      const { error } = await supabase
        .from('sessions')
        .update({ title: newTitle })
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Rename session failed:', error);
      rollback(snapshot);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to rename session'
      };
    } finally {
      pendingOpsRef.current.delete(operationKey);
    }
  }, [captureSnapshot, queryClient, rollback, user?.id]);

  // Optimistic rename folder
  const optimisticRenameFolder = useCallback(async (
    folderId: string,
    newName: string
  ): Promise<OptimisticUpdateResult> => {
    if (!user?.id) return { success: false, error: 'User not authenticated' };

    const operationKey = `rename-folder-${folderId}`;
    if (pendingOpsRef.current.has(operationKey)) {
      return { success: false, error: 'Operation already in progress' };
    }

    const snapshot = captureSnapshot();
    pendingOpsRef.current.add(operationKey);

    try {
      // Optimistic update
      const updatedFolders = snapshot.folders.map(folder =>
        folder.folder_id === folderId
          ? { ...folder, folder_name: newName }
          : folder
      );

      queryClient.setQueryData(['user-folders', user.id], updatedFolders);

      // Database update
      const success = await renameFolder(folderId, newName);
      if (!success) throw new Error('Failed to rename folder');

      return { success: true };
    } catch (error) {
      console.error('Rename folder failed:', error);
      rollback(snapshot);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to rename folder'
      };
    } finally {
      pendingOpsRef.current.delete(operationKey);
    }
  }, [captureSnapshot, queryClient, rollback, user?.id]);

  // Optimistic move session
  const optimisticMoveSession = useCallback(async (
    sessionId: string,
    folderId: string | null
  ): Promise<OptimisticUpdateResult> => {
    if (!user?.id) return { success: false, error: 'User not authenticated' };

    const operationKey = `move-session-${sessionId}`;
    if (pendingOpsRef.current.has(operationKey)) {
      return { success: false, error: 'Operation already in progress' };
    }

    const snapshot = captureSnapshot();
    pendingOpsRef.current.add(operationKey);

    try {
      // Optimistic update
      const updatedSessions = snapshot.sessions.map(session =>
        session.session_id === sessionId
          ? { ...session, folder_id: folderId }
          : session
      );

      queryClient.setQueryData(['user-sessions', user.id], updatedSessions);

      // Database update
      const success = await moveSessionToFolder(sessionId, folderId);
      if (!success) throw new Error('Failed to move session');

      return { success: true };
    } catch (error) {
      console.error('Move session failed:', error);
      rollback(snapshot);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to move session'
      };
    } finally {
      pendingOpsRef.current.delete(operationKey);
    }
  }, [captureSnapshot, queryClient, rollback, user?.id]);

  // Optimistic delete folder
  const optimisticDeleteFolder = useCallback(async (
    folderId: string
  ): Promise<OptimisticUpdateResult> => {
    if (!user?.id) return { success: false, error: 'User not authenticated' };

    const operationKey = `delete-folder-${folderId}`;
    if (pendingOpsRef.current.has(operationKey)) {
      return { success: false, error: 'Operation already in progress' };
    }

    const snapshot = captureSnapshot();
    pendingOpsRef.current.add(operationKey);

    try {
      // Optimistic update
      const updatedFolders = snapshot.folders.filter(
        folder => folder.folder_id !== folderId
      );
      const updatedSessions = snapshot.sessions.map(session =>
        session.folder_id === folderId
          ? { ...session, folder_id: null }
          : session
      );

      queryClient.setQueryData(['user-folders', user.id], updatedFolders);
      queryClient.setQueryData(['user-sessions', user.id], updatedSessions);

      // Database update
      const success = await deleteFolder(folderId);
      if (!success) throw new Error('Failed to delete folder');

      return { success: true };
    } catch (error) {
      console.error('Delete folder failed:', error);
      rollback(snapshot);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete folder'
      };
    } finally {
      pendingOpsRef.current.delete(operationKey);
    }
  }, [captureSnapshot, queryClient, rollback, user?.id]);

  return {
    optimisticRenameSession,
    optimisticRenameFolder,
    optimisticMoveSession,
    optimisticDeleteFolder,
  };
}