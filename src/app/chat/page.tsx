'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import ChatSidebar from '@/features/chat/components/ChatSidebar';
import ChatMainView from '@/features/chat/components/ChatMainView';
import AuthModal from '@/components/modals/AuthModal';
import AuthStatus from '@/components/auth/AuthStatus';
import { useAuth } from '@/contexts/AuthContext';
import { useSignOut } from '@/features/auth/hooks/useSignOut';
import { useStartAnonymousSession } from '@/features/auth/hooks/useStartAnonymousSession';
import { useGetUserSessions } from '@/features/chat/hooks/useGetUserSesssions';
import { useGetSessionMessages } from '@/features/chat/hooks/useGetSessionMessages';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const signOut = useSignOut();
  const startAnon = useStartAnonymousSession();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');

  const hasInitializedAnonymousRef = useRef(false);

  const { data: sessionIds = [], isLoading: sessionsLoading } = useGetUserSessions(user?.id || '');

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

  const handleNewChat = () => {
    setIsSidebarOpen(false);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = (content: string) => {
    if (!activeSessionId) return;
    // TODO: Send message to API
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
        sessionIds={sessionIds}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <ChatMainView
        messages={currentMessages}
        onSendMessage={handleSendMessage}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Auth Status - Top Right */}
      {!loading && user && (
        <div className="fixed top-6 right-6 z-40">
          <AuthStatus />
        </div>
      )}

      {/* Floating auth buttons */}
      {!loading && !user && (
        <div className="fixed top-4 right-8 z-40 flex gap-2">
          <button
            onClick={() => { setAuthModalMode('signin'); setIsAuthModalOpen(true); }}
            className="px-6 py-2 bg-primary text-white rounded-full body-16-semi shadow-lg hover:bg-primary/90 hover:scale-102 transition-all duration-200"
          >
            Sign In
          </button>
          <button
            onClick={() => { setAuthModalMode('signup'); setIsAuthModalOpen(true); }}
            className="px-6 py-2 bg-secondary-2 text-white rounded-full body-16-semi shadow-lg hover:bg-secondary-2/90 hover:scale-102 transition-all duration-200 flex items-center gap-2"
          >
            Sign Up
          </button>
        </div>
      )}

      {/* Test Logout (only when authenticated) */}
      {/* {!loading && user && (
        <button
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
          className="fixed top-4 right-8 px-6 py-2 bg-neutral-10 text-white rounded-full body-16-semi shadow-lg hover:bg-neutral-9 hover:scale-105 transition-all duration-200 z-40"
        >
          {signOut.isPending ? 'Signing out...' : 'Test Logout'}
        </button>
      )} */}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}
