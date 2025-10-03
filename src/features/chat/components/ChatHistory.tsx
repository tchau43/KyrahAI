'use client';

import { Button } from '@heroui/react';
import { Conversation } from '../data';

interface ChatHistoryProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export default function ChatHistory({
  conversations,
  activeConversationId,
  onSelectConversation,
}: ChatHistoryProps) {
  return (
    <div className="flex-1 overflow-y-auto p-2">
      <div className="text-xs font-semibold text-neutral-9 px-3 py-2 uppercase tracking-normal">
        Recent Chats
      </div>
      <div className="space-y-1">
        {conversations.map(conversation => (
          <Button
            key={conversation.id}
            onPress={() => onSelectConversation(conversation.id)}
            className={`w-full justify-start px-3 py-3 h-auto ${
              activeConversationId === conversation.id
                ? 'bg-neutral-3 text-neutral-9'
                : 'bg-transparent text-neutral-8'
            }`}
            variant="light"
          >
            <div className="body-14-semi truncate w-full text-left">
              {conversation.title}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
