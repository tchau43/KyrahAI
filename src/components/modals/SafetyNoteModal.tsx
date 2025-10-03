'use client';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';
import { useEffect, useState } from 'react';
import { ExitIcon, TurnRightIcon } from '../icons';
import { useModalState } from '@/hooks/useModalState';

export default function SafetyNoteModal() {
  const { checkIfModalSeen, setModalSeen } = useModalState();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenModal = checkIfModalSeen();
    if (!hasSeenModal) {
      setIsOpen(true);
    }
  }, [checkIfModalSeen]);

  const handleClose = () => {
    setIsOpen(false);
    setModalSeen();
  };

  return (
    <Modal
      hideCloseButton
      isDismissable={false}
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      classNames={{
        base: 'bg-neutral rounded-3xl',
        header: 'border-b-0',
        body: 'py-6',
        footer: 'border-t-0',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-center text-neutral-9">
          <h2 className="heading-32 ">Safety Note</h2>
        </ModalHeader>
        <ModalBody className="px-12">
          <p className="body-18-regular text-center mb-4">
            Your privacy is paramount. For added discretion, use
            Incognito/Private mode or clear your browser history.
          </p>
          <p className="body-18-regular text-center">
            If you&apos;re in immediate danger, call your local emergency
            number. Use the{' '}
            <span className="inline-flex items-center px-3 py-1 rounded-full border-1 border-neutral-9 text-sm font-medium gap-2">
              Safe Exit <ExitIcon size={14} />
            </span>{' '}
            on the right side of the top bar to leave this page instantly.
          </p>
        </ModalBody>
        <ModalFooter className="flex justify-center pb-8">
          <Button
            onPress={handleClose}
            className="bg-neutral-9 text-white px-16 py-6 text-lg rounded-full hover:bg-slate-800"
            size="lg"
          >
            <div className="flex items-center gap-2">
              I understand, let&apos;s continue <TurnRightIcon />
            </div>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
