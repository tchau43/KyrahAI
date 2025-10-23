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
} from '@heroui/react';
import { useState, useEffect } from 'react';
import { Folder } from '../icons';
import { moveSessionToFolder } from '@/lib/chat';
import { useCreateFolder } from '@/features/chat/hooks/useCreateFolder';
interface FolderModalProps {
  sessionIdToMove?: string;
}

export default function FolderModal({ sessionIdToMove }: FolderModalProps) {
  const { isModalOpen, closeModal } = useModalStore();
  const { user } = useAuth();
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');

  // Sử dụng useCreateFolder hook
  const createFolderMutation = useCreateFolder();

  // Reset form khi modal mở
  useEffect(() => {
    if (isModalOpen('folder-modal')) {
      setFolderName('');
      setError('');
    }
  }, [isModalOpen]);

  const handleCreateFolder = async () => {
    if (!folderName.trim() || !user) {
      setError('Folder name is required');
      return;
    }

    try {
      setError('');

      const newFolder = await createFolderMutation.mutateAsync(folderName.trim());

      if (newFolder) {
        // Nếu có session cần move vào folder mới
        if (sessionIdToMove) {
          await moveSessionToFolder(sessionIdToMove, newFolder.folder_id);
        }

        closeModal('folder-modal');
      } else {
        setError('Failed to create folder');
      }

      setFolderName('');
    } catch (err) {
      console.error('Failed to create folder:', err);
      setError('An error occurred');
    }
  };

  const handleCancel = () => {
    closeModal('folder-modal');
  };

  const isOpen = isModalOpen('folder-modal');

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
                <Folder className="text-primary" size={24} />
                <h2 className="heading-24 md:!text-[28px]">Create a new folder</h2>
              </div>
              <p className="body-16-regular text-neutral-6 mt-2">
                Easily organize your conversations into folders.
              </p>
            </ModalHeader>

            <ModalBody className="px-4 xl:!px-6">
              <div className="space-y-3">
                <label className="body-16-semi text-neutral-9 block">Folder name</label>
                <input
                  type="text"
                  autoFocus
                  value={folderName}
                  onChange={(e) => {
                    setFolderName(e.target.value);
                    if (error) setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && folderName.trim()) {
                      handleCreateFolder();
                    }
                  }}
                  placeholder="Enter your folder name here"
                  className={`w-full px-4 py-2.5 bg-neutral border rounded-lg body-16-regular text-neutral-9 placeholder:text-neutral-5 focus:outline-none transition-colors ${error
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-neutral-4 focus:border-primary'
                    }`}
                  maxLength={50}
                />
                <div className="flex justify-between items-center">
                  <p className="caption-14-regular text-neutral-6">
                    {folderName.length}/50 characters
                  </p>
                  {error && <p className="caption-14-regular text-red-500">{error}</p>}
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="flex justify-center gap-3 pb-6 xl:!pb-8 pt-2 xl:!pt-4 px-4 xl:!px-6">
              <Button
                variant="bordered"
                onPress={onModalClose}
                isDisabled={createFolderMutation.isPending}
                className="border-2 border-neutral-9 text-neutral-9 w-full xl:!w-auto py-5 body-16-semi rounded-full hover:bg-neutral-1"
                size="lg"
              >
                Cancel
              </Button>
              <Button
                onPress={handleCreateFolder}
                isDisabled={!folderName.trim() || createFolderMutation.isPending}
                isLoading={createFolderMutation.isPending}
                className="bg-neutral-9 text-neutral w-full xl:!w-auto py-5 body-16-semi rounded-full hover:bg-slate-800 disabled:opacity-50"
                size="lg"
              >
                {createFolderMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}