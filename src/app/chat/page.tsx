'use client';

import { useEffect, useRef, useState } from 'react';
import ChatSidebar from '@/features/chat/components/ChatSidebar';
import ChatMainView from '@/features/chat/components/ChatMainView';
import AuthModalTest from '@/components/modals/AuthModalTest';
import AuthStatusTest from '@/components/auth/AuthStatusTest';
import { Message } from '@/features/chat/data';
import { useAuth } from '@/contexts/AuthContext';
import { useSignOut } from '@/features/auth/hooks/useSignOut';
import { useStartAnonymousSession } from '@/features/auth/hooks/useStartAnonymousSession';
import { useGetUserSessions } from '@/features/auth/hooks/useGetUserSesssions';

export default function ChatPage() {
  const { user, authType, loading } = useAuth();
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>user1', user);
  const signOut = useSignOut();
  const startAnon = useStartAnonymousSession();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');

  const hasInitializedAnonymousRef = useRef(false);

  const { data: sessionIds = [], isLoading: sessionsLoading } = useGetUserSessions(user?.id || '');

  const handleNewChat = () => {
    // Placeholder: will call API to create session; for now just close sidebar
    setIsSidebarOpen(false);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = (content: string) => {
    // Placeholder: will send message to API tied to activeSessionId
    if (!activeSessionId) return;
  };

  // Initialize anonymous session on first unauthenticated visit
  useEffect(() => {
    if (hasInitializedAnonymousRef.current) return;
    if (!loading && !user) {
      hasInitializedAnonymousRef.current = true;
      startAnon.mutate();
    }
  }, [loading, user]);

  // Safe client-only log of localStorage value
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log(
        ">>>>>>>>>>>>>>>>>>>>>>>>>>kyrah_anonymous_session_id",
        window.localStorage.getItem("kyrah_anonymous_session_id")
      );
    }
  }, []);

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
        conversation={null}
        onSendMessage={handleSendMessage}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Auth Status - Top Right */}
      <div className="fixed top-6 right-6 z-40">
        <AuthStatusTest />
      </div>

      {/* Floating auth buttons */}
      {!loading && !user && (
        <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-3">
          <button
            onClick={() => { setAuthModalMode('signup'); setIsAuthModalOpen(true); }}
            className="px-6 py-3 bg-secondary-2 text-white rounded-full body-16-semi shadow-lg hover:bg-secondary-1 hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Test Sign Up
          </button>
          <button
            onClick={() => { setAuthModalMode('signin'); setIsAuthModalOpen(true); }}
            className="px-6 py-3 bg-neutral-10 text-white rounded-full body-16-semi shadow-lg hover:bg-neutral-9 hover:scale-105 transition-all duration-200"
          >
            Test Sign In
          </button>
        </div>
      )}

      {/* Test Logout (only when authenticated) */}
      {!loading && user && (
        <button
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
          className="fixed bottom-8 right-8 px-6 py-3 bg-neutral-10 text-white rounded-full body-16-semi shadow-lg hover:bg-neutral-9 hover:scale-105 transition-all duration-200 z-40"
        >
          {signOut.isPending ? 'Signing out...' : 'Test Logout'}
        </button>
      )}

      {/* Auth Modal */}
      <AuthModalTest
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}
