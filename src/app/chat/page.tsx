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
import { getAuthToken } from '@/lib/auth-token';
import { Resource } from '@/types/risk-assessment';

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
  resources?: Resource[];
  riskLevel?: string;
}

// Add this interface for type safety
interface MessageWithResources extends Message {
  resources?: Resource[];
  riskLevel?: string;
  isStreaming?: boolean;
}

export default function ChatPage() {
  const { user, loading } = useAuth();
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
        setActiveSessionId(savedSessionId);
      }
    }
  }, []);

  const { data: sessions = [], isLoading: sessionsLoading } = useGetUserSessions(user?.id || '');
  const { data: messagesData, isLoading: messagesLoading } = useGetSessionMessages({
    sessionId: activeSessionId || '',
    limit: 30,
    offset: 0,
  });

  // Merge DB messages with optimistic messages, dedupe by message_id
  const currentMessages = useMemo(() => {
    if (!activeSessionId) return null;
    const dbMessages = messagesData?.messages || [];

    const byId = new Map<string, MessageWithResources>();

    // Process DB messages and extract resources from metadata
    for (const m of dbMessages) {
      const messageWithResources: MessageWithResources = {
        ...m,
        // Extract resources from metadata if exists
        resources: (m.metadata as any)?.resources || undefined,
        riskLevel: (m.metadata as any)?.riskLevel || undefined,
      };
      byId.set(m.message_id, messageWithResources);
    }

    // Overlay optimistic messages (prefer optimistic if same id)
    for (const m of optimisticMessages) {
      byId.set(m.message_id, m as unknown as MessageWithResources);
    }

    const merged = Array.from(byId.values());
    return merged.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [activeSessionId, messagesData, optimisticMessages]);

  const handleNewChat = async () => {
    setIsSidebarOpen(false);
    setOptimisticMessages([]);
    clearTempSession();
    const temp = await createTempSession();
    setActiveSessionId(temp.session_id);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('kyrah_active_session_id', temp.session_id);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setOptimisticMessages([]);
    clearTempSession();
    setIsSidebarOpen(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('kyrah_active_session_id', sessionId);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (isProcessing) return;

    setIsProcessing(true);

    const tempSessionId = getTempSessionId();
    const currentSessionId = tempSessionId || activeSessionId;

    if (!currentSessionId) {
      setIsProcessing(false);
      return;
    }

    // 1. User message
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

    // 2. Assistant message placeholder
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
      await streamChatResponse(currentSessionId, content, tempSessionId !== null, assistantMsgId, userMsgId);

      if (tempSessionId) {
        clearTempSession();
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('kyrah_active_session_id', currentSessionId);
        }
        await queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
        await queryClient.invalidateQueries({ queryKey: ['session-messages'] });
      }
    } catch (error) {
      console.error('Error sending message:', error);
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

    // Store resources and risk level temporarily
    let currentResources: Resource[] = [];
    let currentRiskLevel: string | undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));

          if (data.type === 'token') {
            // Update streaming assistant message
            setOptimisticMessages(prev =>
              prev.map(msg =>
                msg.message_id === assistantMsgId
                  ? { ...msg, content: msg.content + data.content }
                  : msg
              )
            );
          }
          // ============================================
          // NEW: Handle resources event
          // ============================================
          else if (data.type === 'resources') {
            currentResources = data.resources || [];
            currentRiskLevel = data.risk_level;

            // Immediately attach to assistant message
            setOptimisticMessages(prev =>
              prev.map(msg =>
                msg.message_id === assistantMsgId
                  ? {
                    ...msg,
                    resources: currentResources,
                    riskLevel: currentRiskLevel
                  }
                  : msg
              )
            );
          }
          else if (data.type === 'risk_assessment') {
            currentRiskLevel = data.risk_level;
          }
          else if (data.type === 'crisis_alert') {
            console.warn('⚠️ CRISIS ALERT:', data.message);
          }
          else if (data.type === 'done') {
            const savedUser = data.userMessage as Message;
            const savedAssistant = data.assistantMessage as Message;

            setOptimisticMessages(prev =>
              prev.map(msg => {
                if (msg.message_id === assistantMsgId) {
                  return {
                    ...savedAssistant,
                    isOptimistic: false,
                    isStreaming: false,
                    resources: currentResources,
                    riskLevel: currentRiskLevel,
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

  // Restore active session on page load/refresh
  useEffect(() => {
    if (hasRestoredSessionRef.current) return;
    if (loading || sessionsLoading) return;

    hasRestoredSessionRef.current = true;

    if (typeof window !== 'undefined') {
      const savedSessionId = sessionStorage.getItem('kyrah_active_session_id');

      if (savedSessionId) {
        if (user) {
          const hasAccess = sessions.some(s => s.session_id === savedSessionId);
          if (hasAccess) {
            setActiveSessionId(savedSessionId);
            setIsInitialized(true);
            return;
          } else {
            sessionStorage.removeItem('kyrah_active_session_id');
          }
        } else {
          const anonToken = sessionStorage.getItem('kyrah_anonymous_token');
          if (anonToken) {
            setActiveSessionId(savedSessionId);
            setIsInitialized(true);
            return;
          } else {
            sessionStorage.removeItem('kyrah_active_session_id');
          }
        }
      }

      const tempSessionId = getTempSessionId();
      if (tempSessionId) {
        setActiveSessionId(tempSessionId);
        setIsInitialized(true);
        return;
      }
    }

    setIsInitialized(true);
  }, [loading, user, sessions, sessionsLoading]);

  useEffect(() => {
    if (!isInitialized || !user || sessionsLoading || !sessions) return;

    const savedSessionId = sessionStorage.getItem('kyrah_active_session_id');
    if (savedSessionId && !activeSessionId) {
      const hasAccess = sessions.some(s => s.session_id === savedSessionId);
      if (hasAccess) {
        setActiveSessionId(savedSessionId);
      } else {
        sessionStorage.removeItem('kyrah_active_session_id');
      }
    }
  }, [isInitialized, user, sessions, sessionsLoading, activeSessionId]);

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

      {!loading && user && (
        <div className="fixed top-3 right-3 md:top-4 md:right-4 xl:top-6 xl:right-6 z-40">
          <AuthStatus />
        </div>
      )}

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
    </div>
  );
}