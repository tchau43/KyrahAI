'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import ChatSidebar from '@/features/chat/components/ChatSidebar';
import ChatMainView from '@/features/chat/components/ChatMainView';
import AuthStatus from '@/components/auth/AuthStatus';
import { useAuth } from '@/contexts/AuthContext';
import { useStartAnonymousSession } from '@/features/auth/hooks/useStartAnonymousSession';
import { useGetUserSessions } from '@/features/chat/hooks/useGetUserSesssions';
import { useGetSessionMessages } from '@/features/chat/hooks/useGetSessionMessages';
import { createTempSession, getTempSessionId, clearTempSession } from '@/lib/auth';
import type { Message } from '@/features/chat/data';
import { Menu } from '@/components/icons';
import { useModalStore } from '@/store/useModalStore';

interface OptimisticMessage {
  message_id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  token_count: number | null;
  metadata: Record<string, unknown>;
  deleted_at: string | null;
  isOptimistic?: boolean;
  isStreaming?: boolean;
}

export default function ChatPage() {
  const { user, loading } = useAuth();
  // console.log('user', user);
  const startAnon = useStartAnonymousSession();
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { openModal } = useModalStore();
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const hasInitializedAnonymousRef = useRef(false);
  const hasRestoredSessionRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Immediate restore from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSessionId = sessionStorage.getItem('kyrah_active_session_id');
      if (savedSessionId && !activeSessionId) {
        console.log('Immediate restore:', savedSessionId);
        setActiveSessionId(savedSessionId);
      }
    }
  }, []); // Run only once on mount

  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>ChatPage user', user);

  const { data: sessions = [], isLoading: sessionsLoading } = useGetUserSessions(user?.id || '');
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>ChatPage sessions', sessions);
  // Fetch messages for active session
  const { data: messagesData, isLoading: messagesLoading } = useGetSessionMessages({
    sessionId: activeSessionId || '',
    limit: 30,
    offset: 0,
  });

  // Merge DB messages with optimistic messages, dedupe by message_id (prefer optimistic during streaming)
  const currentMessages = useMemo(() => {
    if (!activeSessionId) return null;
    const dbMessages = messagesData?.messages || [];

    const byId = new Map<string, (Message & { isStreaming?: boolean })>();

    // Start with DB messages
    for (const m of dbMessages) {
      byId.set(m.message_id, m as Message);
    }

    // Overlay optimistic messages (prefer optimistic if same id)
    for (const m of optimisticMessages) {
      byId.set(m.message_id, m as unknown as Message & { isStreaming?: boolean });
    }

    const merged = Array.from(byId.values());
    return merged.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [activeSessionId, messagesData, optimisticMessages]);

  const handleNewChat = async () => {
    setIsSidebarOpen(false);
    setOptimisticMessages([]); // Clear optimistic messages for new chat
    clearTempSession(); // Clear old temp session before creating new one
    const temp = await createTempSession();
    setActiveSessionId(temp.session_id);
    // Save to sessionStorage for persistence on refresh
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('kyrah_active_session_id', temp.session_id);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setOptimisticMessages([]); // Clear optimistic messages when switching sessions
    clearTempSession(); // Clear temp session when selecting an existing session
    setIsSidebarOpen(false);
    // Save to sessionStorage for persistence on refresh
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('kyrah_active_session_id', sessionId);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (isProcessing) return; // Prevent multiple simultaneous requests

    setIsProcessing(true);

    // Check if this is a temp session (first message)
    const tempSessionId = getTempSessionId();
    const currentSessionId = tempSessionId || activeSessionId;

    if (!currentSessionId) {
      setIsProcessing(false);
      return;
    }

    // 1. Immediately show user message (optimistic update)
    const userMsgId = `temp-user-${Date.now()}`;
    const userMessage: OptimisticMessage = {
      message_id: userMsgId,
      session_id: currentSessionId,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      isOptimistic: true,
      token_count: null,
      metadata: {},
      deleted_at: null,
    };

    setOptimisticMessages(prev => [...prev, userMessage]);

    // 2. Create placeholder for assistant message (will be streamed)
    const assistantMsgId = `temp-assistant-${Date.now()}`;
    const assistantMessage: OptimisticMessage = {
      message_id: assistantMsgId,
      session_id: currentSessionId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isOptimistic: true,
      isStreaming: true,
      token_count: null,
      metadata: {},
      deleted_at: null,
    };

    setOptimisticMessages(prev => [...prev, assistantMessage]);

    try {
      // 3. Stream the response from API
      await streamChatResponse(currentSessionId, content, tempSessionId !== null, assistantMsgId, userMsgId);

      // 4. After streaming completes, we do NOT immediately refetch.
      // Optimistic messages were replaced with saved DB records (same message_id),
      // so view is stable. Optionally refresh in background later if needed.
      if (tempSessionId) {
        // Clear temp session after first message successfully saved
        clearTempSession();
        // Update sessionStorage with the real session ID (it's the same, but now persisted)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('kyrah_active_session_id', currentSessionId);
        }
        // Invalidate queries to refresh session list
        console.log('First message sent, invalidating session queries');
        await queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
        await queryClient.invalidateQueries({ queryKey: ['session-messages'] });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic messages on error
      setOptimisticMessages([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const streamChatResponse = async (
    sessionId: string,
    userMessage: string,
    isFirstMessage: boolean,
    assistantMsgId: string,
    userMsgId: string
  ) => {
    const authToken = await getAuthToken();
    const isJwt = typeof authToken === 'string' && authToken.split('.').length === 3;

    let anonymousToken: string | null = null;
    if (typeof window !== 'undefined') {
      try {
        anonymousToken = sessionStorage.getItem('kyrah_anonymous_token');
      } catch { }
    }

    // Prepare user info for server
    const userInfo = user ? {
      id: user.id,
      email: user.email,
      isAuthenticated: true,
    } : {
      isAuthenticated: false,
    };

    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(isJwt && authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(anonymousToken ? { 'X-Anonymous-Token': anonymousToken } : {}),
      },
      body: JSON.stringify({
        sessionId,
        userMessage,
        isFirstMessage,
        user: userInfo,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to stream response');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No reader available');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));

          if (data.type === 'token') {
            // Update the streaming assistant message
            setOptimisticMessages(prev =>
              prev.map(msg =>
                msg.message_id === assistantMsgId
                  ? { ...msg, content: msg.content + data.content }
                  : msg
              )
            );
          } else if (data.type === 'done') {
            // Replace optimistic temp messages with saved DB messages to keep message_id stable
            const savedUser = data.userMessage as Message;
            const savedAssistant = data.assistantMessage as Message;

            setOptimisticMessages(prev =>
              prev.map(msg => {
                if (msg.message_id === assistantMsgId) {
                  return {
                    ...savedAssistant,
                    isOptimistic: false,
                    isStreaming: false,
                  } as unknown as OptimisticMessage;
                }
                if (msg.message_id === userMsgId) {
                  return {
                    ...savedUser,
                    isOptimistic: false,
                  } as unknown as OptimisticMessage;
                }
                return msg;
              }),
            );
          } else if (data.type === 'error') {
            throw new Error(data.error);
          }
        }
      }
    }
  };

  // Helper to get auth token
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      if (session?.access_token) {
        const token = session.access_token;
        const isJwt = typeof token === 'string' && token.split('.').length === 3;
        return isJwt ? token : null;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Restore active session on page load/refresh
  useEffect(() => {
    if (hasRestoredSessionRef.current) return;
    if (loading || sessionsLoading) return; // Wait for auth and sessions to load

    hasRestoredSessionRef.current = true;

    // Try to restore from sessionStorage
    if (typeof window !== 'undefined') {
      const savedSessionId = sessionStorage.getItem('kyrah_active_session_id');
      console.log('Restoring session:', { savedSessionId, user: !!user, userId: user?.id, sessionsCount: sessions?.length, sessionsLoading });

      if (savedSessionId) {
        // Validate session access
        if (user) {
          // For authenticated users, check if session exists in their sessions list
          const hasAccess = sessions.some(s => s.session_id === savedSessionId);
          console.log('Authenticated user session check:', { hasAccess, savedSessionId, sessionsList: sessions.map(s => s.session_id) });
          if (hasAccess) {
            setActiveSessionId(savedSessionId);
            setIsInitialized(true);
            return;
          } else {
            // Session not accessible, clear it
            console.log('Session not accessible, clearing');
            sessionStorage.removeItem('kyrah_active_session_id');
          }
        } else {
          // For anonymous users, check if we have a valid token
          const anonToken = sessionStorage.getItem('kyrah_anonymous_token');
          console.log('Anonymous user session check:', { hasToken: !!anonToken, savedSessionId });
          if (anonToken) {
            // Assume valid for now, will be validated when fetching messages
            setActiveSessionId(savedSessionId);
            setIsInitialized(true);
            return;
          } else {
            // No token, clear saved session
            console.log('No anonymous token, clearing session');
            sessionStorage.removeItem('kyrah_active_session_id');
          }
        }
      }

      // Check if there's a temp session ID (for new anonymous sessions)
      const tempSessionId = getTempSessionId();
      console.log('Temp session check:', { tempSessionId });
      if (tempSessionId) {
        setActiveSessionId(tempSessionId);
        setIsInitialized(true);
        return;
      }
    }

    setIsInitialized(true);
  }, [loading, user, sessions, sessionsLoading]);

  // Additional effect to restore session when sessions data becomes available
  useEffect(() => {
    if (!isInitialized || !user || sessionsLoading || !sessions) return;

    const savedSessionId = sessionStorage.getItem('kyrah_active_session_id');
    if (savedSessionId && !activeSessionId) {
      console.log('Late restore attempt:', { savedSessionId, sessionsCount: sessions.length });
      const hasAccess = sessions.some(s => s.session_id === savedSessionId);
      if (hasAccess) {
        console.log('Late restore successful');
        setActiveSessionId(savedSessionId);
      } else {
        console.log('Late restore failed, clearing session');
        sessionStorage.removeItem('kyrah_active_session_id');
      }
    }
  }, [isInitialized, user, sessions, sessionsLoading, activeSessionId]);

  // Initialize anonymous session on first unauthenticated visit
  useEffect(() => {
    if (hasInitializedAnonymousRef.current) return;
    if (!loading && !user) {
      hasInitializedAnonymousRef.current = true;
      startAnon.mutate();
    }
  }, [loading, user]);

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col relative">
        {user && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-3 left-3 md:top-4 md:left-4 xl:hidden z-30 p-2 rounded-lg bg-neutral hover:bg-neutral-2 transition-colors shadow-md"
            aria-label="Open menu"
          >
            <Menu size={24} className="text-neutral-9" />
          </button>
        )}
        <ChatMainView
          messages={currentMessages}
          onSendMessage={handleSendMessage}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>


      {/* Auth Status - Top Right (Responsive) */}
      {!loading && user && (
        <div className="fixed top-3 right-3 md:top-4 md:right-4 xl:top-6 xl:right-6 z-40">
          <AuthStatus />
        </div>
      )}

      {/* Floating auth buttons (Responsive) */}
      {!loading && !user && (
        <div className="fixed top-3 right-3 md:top-4 md:right-6 xl:top-4 xl:right-8 z-40 flex gap-2">
          <button
            onClick={() => {
              useModalStore.getState().setAuthMode('signin');
              openModal('auth-modal');
            }}
            className="px-6 py-2 bg-primary text-white rounded-full body-16-semi shadow-lg hover:bg-primary/90 hover:scale-102 transition-all duration-200"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              useModalStore.getState().setAuthMode('signup');
              openModal('auth-modal');
            }}
            className="px-6 py-2 bg-secondary-2 text-white rounded-full body-16-semi shadow-lg hover:bg-secondary-2/90 hover:scale-102 transition-all duration-200 flex items-center gap-2"
          >
            Sign Up
          </button>
        </div>
      )}
      {/* Auth Modal is globally mounted via ModalProvider */}
    </div>
  );
}