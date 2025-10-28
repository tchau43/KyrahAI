import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimisticUpdates } from './useOptimisticUpdates';

export function useSessionTitleEditor() {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { optimisticRenameSession } = useOptimisticUpdates();

  useEffect(() => {
    if (editingSessionId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingSessionId]);

  const startEdit = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditTitle(currentTitle);
  };

  const saveTitle = async (sessionId: string) => {
    if (!editTitle.trim() || !user?.id) {
      setEditingSessionId(null);
      return;
    }

    try {
      // Use optimistic update - UI updates immediately
      const result = await optimisticRenameSession(sessionId, editTitle.trim());

      if (!result.success) {
        console.error('Failed to save title:', result.error);
        // You could show a toast notification here
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ['user-sessions', user.id]
      });
    } catch (error) {
      console.error('Error saving title:', error);
    } finally {
      setEditingSessionId(null);
    }
  };

  const cancelEdit = () => {
    setEditingSessionId(null);
    setEditTitle('');
  };

  return {
    editingSessionId,
    editTitle,
    inputRef,
    setEditTitle,
    startEdit,
    saveTitle,
    cancelEdit,
  };
}
