import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';

export function useSessionTitleEditor() {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
      const supabase = createClient();
      const { data, error } = await supabase
        .from('sessions')
        .update({ title: editTitle.trim() })
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .select('session_id');

      if (error || !data || data.length === 0) {
        console.error('Error updating title or no rows updated:', error);
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
