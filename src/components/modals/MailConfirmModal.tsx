'use client';

import { useModalStore } from '@/store/useModalStore';
import { Modal, ModalBody, ModalContent, ModalHeader, Button } from '@heroui/react';

export default function MailConfirmModal() {
  const { isModalOpen, closeModal } = useModalStore();
  const isOpen = isModalOpen('mail-confirm-modal');
  const onClose = () => closeModal('mail-confirm-modal');

  return (
    <Modal
      hideCloseButton
      isDismissable
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      placement="center"
      classNames={{
        wrapper: 'items-center justify-center z-[9999]',
        backdrop: 'z-[9998]',
        base: 'bg-neutral rounded-3xl text-neutral-9 mx-4 my-4 z-[9999] w-full max-w-md',
        header: 'border-b-0',
        body: 'py-4',
      }}
    >
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader className="flex flex-col gap-1 text-center text-neutral-9 pt-6 pb-0 px-4">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-secondary-2/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-secondary-2"
            >
              <path d="M1.5 8.67v8.58A2.25 2.25 0 003.75 19.5h16.5a2.25 2.25 0 002.25-2.25V8.67l-8.708 5.232a3.75 3.75 0 01-3.784 0L1.5 8.67z" />
              <path d="M22.5 6.908V6.75A2.25 2.25 0 0020.25 4.5H3.75A2.25 2.25 0 001.5 6.75v.158l9.158 5.5a2.25 2.25 0 002.184 0L22.5 6.908z" />
            </svg>
          </div>
          <h2 className="heading-32 text-neutral-10">Check your email</h2>
        </ModalHeader>
        <ModalBody className="px-6 pb-8">
          <div className="text-center space-y-4">
            <p className="body-16-regular text-neutral-7">
              We have sent a confirmation link to your email. Please open the link to
              verify your account.
            </p>
            <div className="text-neutral-6 caption-14-regular space-y-2">
              <p>If you don't see the email, check your spam folder.</p>
              <p>Still no email? Try signing up again or use a different address.</p>
            </div>
            <Button
              onClick={onClose}
              className="w-full mt-4 py-6 body-16-semi rounded-full bg-secondary-2 text-white hover:bg-secondary-1"
              size="lg"
            >
              Got it
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

