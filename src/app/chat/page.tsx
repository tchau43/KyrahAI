'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import ChatSidebar from '@/features/chat/components/ChatSidebar';
import ChatMainView from '@/features/chat/components/ChatMainView';
import AuthModal from '@/components/modals/AuthModal';
import AuthStatus from '@/components/auth/AuthStatus';
import { useAuth } from '@/contexts/AuthContext';
import { useStartAnonymousSession } from '@/features/auth/hooks/useStartAnonymousSession';
import { useGetUserSessions } from '@/features/chat/hooks/useGetUserSesssions';
import { useGetSessionMessages } from '@/features/chat/hooks/useGetSessionMessages';
import { createTempSession, getTempSessionId, sendFirstMessage } from '@/lib/auth';
import { useSendMessage } from '@/features/chat/hooks/useSendMessage';
import { Menu } from 'lucide-react';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const startAnon = useStartAnonymousSession();
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');

  const hasInitializedAnonymousRef = useRef(false);

  const { data: sessions = [], isLoading: sessionsLoading } = useGetUserSessions(user?.id || '');
  const sendMessageMutation = useSendMessage(activeSessionId || '');

  // Fetch messages for active session
  const { data: messagesData, isLoading: messagesLoading } = useGetSessionMessages({
    sessionId: activeSessionId || '',
    limit: 30,
    offset: 0,
  });

  // Get messages for current session
  const currentMessages = useMemo(() => {
    if (!activeSessionId || !messagesData?.messages) return null;
    return messagesData.messages;
  }, [activeSessionId, messagesData]);

  const handleNewChat = async () => {
    setIsSidebarOpen(false);
    const temp = await createTempSession();
    setActiveSessionId(temp.session_id);
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async (content: string) => {
    // if (!activeSessionId) return;

    // Check if this is a temp session (first message)
    const tempSessionId = getTempSessionId();
    if (tempSessionId) {
      // First message: create session and message
      const result = await sendFirstMessage({ sessionId: tempSessionId, content });
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>result', result);
      setActiveSessionId(result.session.session_id);
      queryClient.invalidateQueries({ queryKey: ['user-sessions', user?.id || ''] });
      // Invalidate messages query to refetch with new session ID
      queryClient.invalidateQueries({ queryKey: ['session-messages', result.session.session_id] });
    } else {
      // Subsequent messages: just send message
      await sendMessageMutation.mutateAsync(content);
    }
  };

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
            onClick={() => { setAuthModalMode('signin'); setIsAuthModalOpen(true); }}
            className="px-4 py-1.5 md:px-5 md:py-2 xl:px-6 xl:py-2 bg-primary text-white rounded-full caption-12-semi md:!caption-14-semi xl:!body-16-semi shadow-lg hover:bg-primary/90 hover:scale-102 transition-all duration-200"
          >
            Sign In
          </button>
          <button
            onClick={() => { setAuthModalMode('signup'); setIsAuthModalOpen(true); }}
            className="px-4 py-1.5 md:px-5 md:py-2 xl:px-6 xl:py-2 bg-secondary-2 text-white rounded-full caption-12-semi md:!caption-14-semi xl:!body-16-semi shadow-lg hover:bg-secondary-2/90 hover:scale-102 transition-all duration-200 flex items-center gap-1.5 md:gap-2"
          >
            Sign Up
          </button>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}