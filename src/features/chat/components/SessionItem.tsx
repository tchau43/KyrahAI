'use client';

import { Button } from '@heroui/react';
import { useGetSessionById } from '../hooks/useGetSessionById';

interface SessionItemProps {
  sessionId: string;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export default function SessionItem({ sessionId, isActive, onSelect }: SessionItemProps) {
  const { data: session, isLoading } = useGetSessionById(sessionId);

  return (
    <Button
      onPress={() => onSelect(sessionId)}
      className={`w-full justify-start px-3 py-3 h-auto ${isActive
        ? 'bg-neutral-3 text-neutral-9'
        : 'bg-transparent text-neutral-8'
        }`}
      variant="light"
      isLoading={isLoading}
    >
      <div className="body-14-semi truncate w-full text-left">
        {session?.title || sessionId}
      </div>
    </Button>
  );
}
