'use client';

import { Card, CardBody } from '@heroui/react';
import { Message } from '../data';

interface ChatBubbleProps {
  message: Message;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 gap-3`}
    >
      {isUser ? (
        <Card className="max-w-[70%] bg-neutral-9">
          <CardBody className="px-4 py-3">
            <div className="body-16-regular whitespace-pre-wrap break-words text-white">
              {message.content}
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="w-full">
          <div className="body-16-regular whitespace-pre-wrap break-words text-neutral-9">
            {message.content}
          </div>
        </div>
      )}
    </div>
  );
}
