'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useModalStore } from '@/store/useModalStore';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
} from '@heroui/react';
import { useState, useEffect } from 'react';
import { FolderHeart } from '../icons';
import { moveSessionToFolder } from '@/lib/chat';
import { useQueryClient } from '@tanstack/react-query';
import { Session } from '@/types/auth.types';

interface AddSessionsToFolderModalProps {
  folderId: string;
  folderName: string;
  availableSessions: Session[];
}

export default function AddSessionsToFolderModal({
  folderId,
  folderName,
  availableSessions
}: AddSessionsToFolderModalProps) {
  const { isModalOpen, closeModal } = useModalStore();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Reset form khi modal mở
  useEffect(() => {
    if (isModalOpen('add-sessions-to-folder-modal')) {
      setSelectedSessions(new Set());
      setIsLoading(false);
    }
  }, [isModalOpen]);

  const handleSessionToggle = (sessionId: string) => {
    setSelectedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedSessions.size === availableSessions.length) {
      setSelectedSessions(new Set());
    } else {
      setSelectedSessions(new Set(availableSessions.map(s => s.session_id)));
    }
  };

  const handleAddSessions = async () => {
    if (selectedSessions.size === 0) return;

    setIsLoading(true);
    try {
      // Move all selected sessions to the folder
      const promises = Array.from(selectedSessions).map(sessionId =>
        moveSessionToFolder(sessionId, folderId)
      );

      await Promise.all(promises);

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['user-folders', user?.id] });
      await queryClient.invalidateQueries({ queryKey: ['user-sessions', user?.id] });

      closeModal('add-sessions-to-folder-modal');
    } catch (error) {
      console.error('Failed to add sessions to folder:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    closeModal('add-sessions-to-folder-modal');
  };

  const isOpen = isModalOpen('add-sessions-to-folder-modal');
  const isAllSelected = selectedSessions.size === availableSessions.length && availableSessions.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      size="lg"
      classNames={{
        wrapper: 'items-center justify-center z-[9999]',
        backdrop: 'bg-black/50 z-[9998]',
        base: 'bg-neutral rounded-2xl xl:!rounded-3xl text-neutral-9 mx-4 xl:!mx-0',
        header: 'border-b-0',
        body: 'py-4 xl:!py-6',
        footer: 'border-t-0',
      }}
    >
      <ModalContent>
        {(onModalClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-neutral-9 pt-6 xl:!pt-8 pb-2.5 px-4 xl:!px-6">
              <div className="flex items-center gap-3">
                <FolderHeart className="text-primary" size={24} />
                <h2 className="heading-24 md:!text-[28px]">Add chats to folder</h2>
              </div>
              <p className="body-16-regular text-neutral-6 mt-2">
                Select sessions to add to <span className="font-semibold text-neutral-9">"{folderName}"</span>
              </p>
            </ModalHeader>

            <ModalBody className="px-4 xl:!px-6">
              <div className="space-y-4">
                {/* Select All */}
                <div className="flex items-center justify-between p-3 bg-secondary-2 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      isSelected={isAllSelected}
                      onValueChange={handleSelectAll}
                      className="text-primary"
                    />
                    <span className="body-16-semi text-white">
                      Select all ({availableSessions.length} {availableSessions.length === 1 ? 'chat' : 'chats'})
                    </span>
                  </div>
                </div>

                {/* Sessions List */}
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {availableSessions.length === 0 ? (
                    <div className="text-center py-8 text-neutral-6">
                      No available sessions to add
                    </div>
                  ) : (
                    availableSessions.map((session) => (
                      <div
                        key={session.session_id}
                        className="flex items-center gap-3 p-3 bg-neutral-1 rounded-lg hover:bg-neutral-2 transition-colors"
                      >
                        <Checkbox
                          isSelected={selectedSessions.has(session.session_id)}
                          onValueChange={() => handleSessionToggle(session.session_id)}
                          className="text-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="body-14-semi text-neutral-9 truncate">
                            {session.title || session.session_id}
                          </div>
                          <div className="caption-12-regular text-neutral-6">
                            {new Date(session.last_activity_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="flex justify-center gap-3 pb-6 xl:!pb-8 pt-2 xl:!pt-4 px-4 xl:!px-6">
              <Button
                variant="bordered"
                onPress={onModalClose}
                isDisabled={isLoading}
                className="border-2 border-neutral-9 text-neutral-9 w-full xl:!w-auto py-5 body-16-semi rounded-full hover:bg-neutral-1"
                size="lg"
              >
                Cancel
              </Button>
              <Button
                onPress={handleAddSessions}
                isDisabled={selectedSessions.size === 0 || isLoading}
                isLoading={isLoading}
                className="bg-neutral-9 text-neutral w-full xl:!w-auto py-5 body-16-semi rounded-full hover:bg-slate-800 disabled:opacity-50"
                size="lg"
              >
                {isLoading ? 'Adding...' : `Add ${selectedSessions.size} chat${selectedSessions.size !== 1 ? 's' : ''}`}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
