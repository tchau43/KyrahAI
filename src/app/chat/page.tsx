'use client';

import { useState } from 'react';
import ChatSidebar from '@/features/chat/components/ChatSidebar';
import ChatMainView from '@/features/chat/components/ChatMainView';
import { dummyConversations, Conversation, Message } from '@/features/chat/data';

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(dummyConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    dummyConversations[0]?.id || null
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  ) || null;

  const handleNewChat = () => {
    // Check if there's already an empty conversation
    const hasEmptyConversation = conversations.some(
      (conv) => conv.messages.length === 0
    );

    if (hasEmptyConversation) {
      // Find and switch to the existing empty conversation
      const emptyConv = conversations.find((conv) => conv.messages.length === 0);
      if (emptyConv) {
        setActiveConversationId(emptyConv.id);
        setIsSidebarOpen(false);
      }
      return;
    }

    // Create a new conversation only if there are no empty ones
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      updatedAt: new Date(),
    };
    setConversations([newConversation, ...conversations]);
    setActiveConversationId(newConversation.id);
    setIsSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = (content: string) => {
    if (!activeConversationId) return;

    const newUserMessage: Message = {
      id: `${activeConversationId}-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Simulate AI response
    const newAiMessage: Message = {
      id: `${activeConversationId}-${Date.now() + 1}`,
      role: 'assistant',
      content: 'Thank you for your message. I\'m here to help you analyze communication patterns and emotional dynamics. How can I assist you today?',
      timestamp: new Date(Date.now() + 1000),
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === activeConversationId) {
          const updatedMessages = [...conv.messages, newUserMessage, newAiMessage];
          return {
            ...conv,
            messages: updatedMessages,
            title: conv.messages.length === 0 ? content.slice(0, 50) : conv.title,
            updatedAt: new Date(),
          };
        }
        return conv;
      })
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <ChatMainView
        conversation={activeConversation}
        onSendMessage={handleSendMessage}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    </div>
  );
}
