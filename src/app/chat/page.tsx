'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import ChatSidebar from '@/features/chat/components/ChatSidebar';
import ChatMainView from '@/features/chat/components/ChatMainView';
import AuthStatus from '@/components/auth/AuthStatus';
import { useAuth } from '@/contexts/AuthContext';
import { useStartAnonymousSession } from '@/features/auth/hooks/useStartAnonymousSession';
import { useGetUserSessions } from '@/features/chat/hooks/useGetUserSessions';
import { useGetSessionMessages } from '@/features/chat/hooks/useGetSessionMessages';
import { createTempSession, getTempSessionId, clearTempSession } from '@/lib/auth';
import type { Message } from '@/features/chat/data';
import { Menu } from '@/components/icons';
import { useModalStore } from '@/store/useModalStore';
import { getAuthToken } from '@/lib/auth-token';
import { Button } from '@heroui/react';
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

const GREETING_MESSAGES = [
  "I'm here to listen — where would you like to start?",
  "Would you like to share what's on your mind right now?",
  "I'm here with you. Tell me what's been difficult.",
  "Take your time. What feels most pressing today?",
  "If you'd like, I can guide a short grounding exercise.",
  "Would you prefer coping ideas or someone to simply listen?",
  "Tell me more when you're ready — I'm listening.",
  "How are you feeling in this moment?",
  "What has been weighing on you lately?",
  "Would you like to try a brief breathing exercise together?",
  "I can help you explore small steps to feel a bit better — want that?",
  "Would talking through a recent event help you right now?",
  "If it helps, name one small thing that would make today easier.",
  "I'm here without judgment — share whenever you're ready.",
  "Do you want practical strategies or emotional support in this moment?",
  "Would reflecting on what helped before be useful?",
  "Let's take one small step together — what would that be?",
  "How can I best support you right now?",
  "You don't have to explain everything — start with one sentence.",
  "I can help you plan a next step — would you like that?",
  "Would a calming or grounding exercise be helpful now?",
  "What would feel most supportive to you in this moment?",
  "Share as much or as little as you like — I'm here.",
  "Would you like resources, techniques, or a patient ear?",
];

const SUGGESTION_MESSAGES = [
  "I feel sad, maybe I'm being gaslighted",
  "I'm feeling anxious and overwhelmed",
  "Help me deal with stress",
  "I need coping strategies for depression",
];

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
  const [greetingMessage, setGreetingMessage] = useState(GREETING_MESSAGES[0]);
  const [isNewChat, setIsNewChat] = useState(false);
  const [isSelectingSession, setIsSelectingSession] = useState(false);

  const hasInitializedAnonymousRef = useRef(false);
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (activeSessionId) {
      sessionStorage.setItem('kyrah_active_session_id', activeSessionId);
    } else {
      sessionStorage.removeItem('kyrah_active_session_id');
    }
  }, [activeSessionId]);

  const { data: sessions = [], isLoading: sessionsLoading } = useGetUserSessions(user?.id || '');
  const { data: messagesData, isLoading: messagesLoading } = useGetSessionMessages({
    sessionId: activeSessionId || '',
    limit: 30,
    offset: 0,
  });

  // Reset selecting session state when messages are loaded
  useEffect(() => {
    if (!messagesLoading && isSelectingSession) {
      setIsSelectingSession(false);
    }
  }, [messagesLoading, isSelectingSession]);

  // Merge DB messages with optimistic messages, dedupe by message_id
  const currentMessages = useMemo(() => {
    if (optimisticMessages.length > 0 && !activeSessionId) {
      return optimisticMessages.map(m => m as unknown as MessageWithResources);
    }

    if (!activeSessionId) return null;
    if (isNewChat) return null;

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
  }, [activeSessionId, messagesData, optimisticMessages, isNewChat]);

  const handleNewChat = async () => {
    const randomIndex = Math.floor(Math.random() * GREETING_MESSAGES.length);
    setGreetingMessage(GREETING_MESSAGES[randomIndex]);

    setIsSidebarOpen(false);
    setOptimisticMessages([]);
    setIsNewChat(true);

    // Clear active session (no real session yet)
    setActiveSessionId(null);

    // Clear any existing temp session and create new one
    clearTempSession();
    await createTempSession();

    await queryClient.invalidateQueries({ queryKey: ['session-messages'] });
  };

  const handleSelectSession = (sessionId: string) => {
    setIsSelectingSession(true);
    setActiveSessionId(sessionId);
    setOptimisticMessages([]);
    setIsNewChat(false);

    clearTempSession();
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async (content: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setIsNewChat(false);

    const tempSessionId = getTempSessionId();
    const currentSessionId = tempSessionId || activeSessionId;

    if (!currentSessionId) {
      console.error('No session ID available');
      setIsProcessing(false);
      return;
    }

    const isFirstMessage = !!tempSessionId;

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

    // 3. For first message, immediately set activeSessionId to enable message display
    if (isFirstMessage) {
      setActiveSessionId(currentSessionId);
    }

    try {
      // 4. Stream the response from API
      await streamChatResponse(currentSessionId, content, isFirstMessage, assistantMsgId, userMsgId);

      // 5. If this was a temp session (first message), now it's persisted in DB
      // Clear temp session
      if (isFirstMessage) {
        clearTempSession();

        // Invalidate queries to refresh session list
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

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // process any remaining buffered line
        if (buffer) {
          const line = buffer;
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              // handle one last event if needed
            } catch { /* ignore partial */ }
          }
        }
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      // keep the last partial line in buffer
      buffer = lines.pop() ?? '';

      for (const raw of lines) {
        const line = raw.trim();
        if (line.startsWith('data: ')) {
          let data: any;
          try {
            data = JSON.parse(line.slice(6));
          } catch {
            // Put back into buffer if partial and continue
            buffer = line + '\n' + buffer;
            continue;
          }

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

  useEffect(() => {
    if (loading) return;
    if (isInitialized) return;

    const initializePage = async () => {
      const tempSessionId = getTempSessionId();

      // If we have a temp session (from BeginModal or previous new chat)
      if (tempSessionId) {
        setIsNewChat(true);
        setActiveSessionId(null); // No active session yet until first message
        setIsInitialized(true);
        return;
      }

      // For authenticated users: create new chat by default
      if (user) {
        const randomIndex = Math.floor(Math.random() * GREETING_MESSAGES.length);
        setGreetingMessage(GREETING_MESSAGES[randomIndex]);
        setIsNewChat(true);
        setActiveSessionId(null);
        await createTempSession();
        setIsInitialized(true);
        return;
      }

      // No temp session, no user - page is ready but waiting for anonymous init
      setIsInitialized(true);
    };

    initializePage();
  }, [loading, user, isInitialized]);


  useEffect(() => {
    if (hasInitializedAnonymousRef.current) return;
    if (!loading && !user) {
      hasInitializedAnonymousRef.current = true;
      startAnon.mutate();
    }
  }, [loading, user, startAnon]);


  useEffect(() => {
    if (loading) return;

    setIsInitialized(false);

    // Clear active session when user changes
    setActiveSessionId(null);
    setOptimisticMessages([]);
    setIsNewChat(false);

    // Reset anonymous initialization when user signs in
    if (user) {
      hasInitializedAnonymousRef.current = false;
    }
  }, [user, loading]);

  useEffect(() => {
    return () => {
      // Only clear temp session on unmount, keep active session
      clearTempSession();
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {user && (
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isLoading={isSelectingSession || sessionsLoading}
        />
      )}

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
          onNewChat={handleNewChat}
          greetingMessage={greetingMessage}
          showHeader={!user}
          suggestionMessages={SUGGESTION_MESSAGES}
          isLoading={isSelectingSession || (messagesLoading && !!activeSessionId)}
          isProcessing={isProcessing}
        />
      </div>

      {/* Auth Status - Top Right (Responsive) */}
      {!loading && user && (
        <div className="fixed top-3 right-3 md:top-4 md:right-4 xl:top-6 xl:right-6 z-40">
          <AuthStatus />
        </div>
      )}

      {!loading && !user && (
        <div className="fixed top-3 right-3 md:top-4 md:right-6 xl:top-4 xl:right-8 z-40 flex gap-2">
          <Button
            color="primary"
            variant="shadow"
            onPress={() => { useModalStore.getState().setAuthMode('signin'); openModal('auth-modal'); }}
            className="px-4 py-3 md:px-5 md:py-2 xl:px-6 xl:py-2 text-white rounded-full body-16-semi md:!caption-14-semi xl:!body-16-semi shadow-lg hover:bg-primary/90 hover:scale-102 transition-all duration-200"
          >
            Log in
          </Button>
          <Button
            color="secondary"
            variant="shadow"
            onPress={() => { useModalStore.getState().setAuthMode('signup'); openModal('auth-modal'); }}
            className="px-4 py-3 md:px-5 md:py-2 xl:px-6 xl:py-2 text-white rounded-full body-16-semi md:!caption-14-semi xl:!body-16-semi shadow-lg hover:bg-secondary-2/90 hover:scale-102 transition-all duration-200 flex items-center gap-1.5 md:gap-2"
          >
            Sign up
          </Button>
        </div>
      )}
    </div>
  );
}