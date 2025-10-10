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
      placement="center"
      classNames={{
        wrapper: 'items-center justify-center',
        base: 'bg-neutral rounded-2xl xl:!rounded-3xl text-neutral-9 mx-4 xl:!mx-0 my-4 xl:!my-0',
        header: 'border-b-0',
        body: 'py-4 xl:!py-6',
        footer: 'border-t-0',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-center text-neutral-9 pt-6 xl:!pt-10 pb-0 px-4 xl:!px-6">
          <h2 className="heading-28 md:!text-[32px]">Safety Note</h2>
        </ModalHeader>
        <ModalBody className="px-4 xl:!px-10 gap-4 xl:!gap-6">
          <p className="body-16-regular xl:!text-[18px] text-center">
            Your privacy is paramount. For added discretion, use
            Incognito/Private mode or clear your browser history.
          </p>
          <p className="body-16-regular xl:!text-[18px] text-center">
            If you&apos;re in immediate danger, call your local emergency
            number. Use the{' '}
            <span className="inline-flex items-center px-2 xl:!px-3 py-1 rounded-full border-1 border-neutral-9 text-xs xl:!text-sm font-medium gap-1 xl:!gap-2">
              Safe Exit{' '}
              <ExitIcon size={12} className="xl:!w-[14px] xl:!h-[14px]" />
            </span>{' '}
            on the right side of the top bar to leave this page instantly.
          </p>
        </ModalBody>
        <ModalFooter className="flex justify-center pb-6 xl:!pb-10 pt-2 xl:!pt-4 px-4 xl:!px-6">
          <Button
            onPress={handleClose}
            className="bg-neutral-9 text-white px-8 xl:!px-16 py-3 xl:!py-6 text-sm xl:!text-lg rounded-full hover:bg-slate-800 w-full xl:!w-auto"
            size="lg"
          >
            <div className="flex items-center justify-center gap-2 body-16-semi xl:!text-[18px]">
              <span>I understand, let&apos;s continue</span>
              <TurnRightIcon className="w-4 h-4 xl:!w-5 xl:!h-5" />
            </div>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
