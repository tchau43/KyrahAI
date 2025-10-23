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
import { createFolder, renameFolder, moveSessionToFolder } from '@/lib/chat';

interface FolderModalProps {
  mode?: 'create' | 'rename';
  folderId?: string;
  initialName?: string;
  sessionIdToMove?: string;
  onSuccess?: () => void;
}

export default function FolderModal({
  mode = 'create',
  folderId,
  initialName = '',
  sessionIdToMove,
  onSuccess,
}: FolderModalProps) {
  const { isModalOpen, closeModal } = useModalStore();
  const { user } = useAuth();
  const [folderName, setFolderName] = useState(initialName);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isModalOpen('folder-modal')) {
      setFolderName(initialName);
      setError('');
    }
  }, [isModalOpen, initialName]);

  const handleCreate = async () => {
    if (!folderName.trim() || !user) {
      setError('Folder name is required');
      return;
    }

    try {
      setIsCreating(true);
      setError('');

      if (mode === 'create') {
        const newFolder = await createFolder(folderName.trim());

        if (newFolder) {
          // Nếu có sessionIdToMove, chuyển session vào folder mới
          if (sessionIdToMove) {
            await moveSessionToFolder(sessionIdToMove, newFolder.folder_id);
          }

          console.log('Folder created successfully:', newFolder);

          // Callback success
          if (onSuccess) {
            onSuccess();
          }

          // Reset and close
          setFolderName('');
          closeModal('folder-modal');
        } else {
          setError('Failed to create folder');
        }
      } else if (mode === 'rename' && folderId) {
        const success = await renameFolder(folderId, folderName.trim());

        if (success) {
          console.log('Folder renamed successfully');

          // Callback success
          if (onSuccess) {
            onSuccess();
          }

          // Reset and close
          setFolderName('');
          closeModal('folder-modal');
        } else {
          setError('Failed to rename folder');
        }
      }
    } catch (error) {
      console.error('Failed to process folder:', error);
      setError('An error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setFolderName('');
    setError('');
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
                <h2 className="heading-24 md:!text-[28px]">
                  {mode === 'create' ? 'Create a new folder' : 'Rename folder'}
                </h2>
              </div>
              <p className="body-16-regular text-neutral-6 mt-2">
                {mode === 'create'
                  ? 'Easily organize your conversations into folders.'
                  : 'Update the name of your folder.'}
              </p>
            </ModalHeader>

            <ModalBody className="px-4 xl:!px-6">
              <div className="space-y-3">
                <label className="body-16-semi text-neutral-9 block">
                  Folder name
                </label>
                <input
                  type="text"
                  autoFocus
                  value={folderName}
                  onChange={(e) => {
                    setFolderName(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && folderName.trim()) {
                      handleCreate();
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
                  {error && (
                    <p className="caption-14-regular text-red-500">
                      {error}
                    </p>
                  )}
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="flex justify-center gap-3 pb-6 xl:!pb-8 pt-2 xl:!pt-4 px-4 xl:!px-6">
              <Button
                variant="bordered"
                onPress={onModalClose}
                isDisabled={isCreating}
                className="border-2 border-neutral-9 text-neutral-9 w-full xl:!w-auto py-5 body-16-semi rounded-full hover:bg-neutral-1"
                size="lg"
              >
                Cancel
              </Button>
              <Button
                onPress={handleCreate}
                isDisabled={!folderName.trim() || isCreating}
                isLoading={isCreating}
                className="bg-neutral-9 text-neutral w-full xl:!w-auto py-5 body-16-semi rounded-full hover:bg-slate-800 disabled:opacity-50"
                size="lg"
              >
                {isCreating
                  ? (mode === 'create' ? 'Creating...' : 'Renaming...')
                  : (mode === 'create' ? 'Create' : 'Rename')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}