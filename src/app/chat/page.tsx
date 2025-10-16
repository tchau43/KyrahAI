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
import { Menu } from '@/components/icons';
import { Button } from '@heroui/react';

const GREETING_MESSAGES = [
  "I’m here to listen — where would you like to start?",
  "Would you like to share what’s on your mind right now?",
  "I’m here with you. Tell me what’s been difficult.",
  "Take your time. What feels most pressing today?",
  "If you’d like, I can guide a short grounding exercise.",
  "Would you prefer coping ideas or someone to simply listen?",
  "Tell me more when you’re ready — I’m listening.",
  "How are you feeling in this moment?",
  "What has been weighing on you lately?",
  "Would you like to try a brief breathing exercise together?",
  "I can help you explore small steps to feel a bit better — want that?",
  "Would talking through a recent event help you right now?",
  "If it helps, name one small thing that would make today easier.",
  "I’m here without judgment — share whenever you’re ready.",
  "Do you want practical strategies or emotional support in this moment?",
  "Would reflecting on what helped before be useful?",
  "Let’s take one small step together — what would that be?",
  "How can I best support you right now?",
  "You don’t have to explain everything — start with one sentence.",
  "I can help you plan a next step — would you like that?",
  "Would a calming or grounding exercise be helpful now?",
  "What would feel most supportive to you in this moment?",
  "Share as much or as little as you like — I’m here.",
  "Would you like resources, techniques, or a patient ear?",
];

export default function ChatPage() {
  const { user, loading } = useAuth();
  const startAnon = useStartAnonymousSession();
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');
  const [greetingMessage, setGreetingMessage] = useState(GREETING_MESSAGES[0]);

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

    const randomIndex = Math.floor(Math.random() * GREETING_MESSAGES.length);
    setGreetingMessage(GREETING_MESSAGES[randomIndex]);
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async (content: string) => {
    const tempSessionId = getTempSessionId();
    if (tempSessionId) {
      const result = await sendFirstMessage({ sessionId: tempSessionId, content });
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>result', result);
      setActiveSessionId(result.session.session_id);
      queryClient.invalidateQueries({ queryKey: ['user-sessions', user?.id || ''] });
      queryClient.invalidateQueries({ queryKey: ['session-messages', result.session.session_id] });
    } else {
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
      {user && (
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
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
          <Button
            color="primary"
            variant="shadow"
            onPress={() => { setAuthModalMode('signin'); setIsAuthModalOpen(true); }}
            className="px-4 py-3 md:px-5 md:py-2 xl:px-6 xl:py-2 text-white rounded-full body-16-semi md:!caption-14-semi xl:!body-16-semi shadow-lg hover:bg-primary/90 hover:scale-102 transition-all duration-200"
          >
            Sign In
          </Button>
          <Button
            color="secondary"
            variant="shadow"
            onPress={() => { setAuthModalMode('signup'); setIsAuthModalOpen(true); }}
            className="px-4 py-3 md:px-5 md:py-2 xl:px-6 xl:py-2 text-white rounded-full body-16-semi md:!caption-14-semi xl:!body-16-semi shadow-lg hover:bg-secondary-2/90 hover:scale-102 transition-all duration-200 flex items-center gap-1.5 md:gap-2"
          >
            Sign Up
          </Button>
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