'use client';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';
import Link from 'next/link';
import { useModalStore } from '@/store/useModalStore';
import { useRouter } from 'next/navigation';

export default function BeginModal() {
  const { isModalOpen, closeModal } = useModalStore();
  const router = useRouter();
  const isOpen = isModalOpen('begin-modal');
  const handleClose = () => closeModal('begin-modal');
  const handleContinue = () => {
    router.push('/chat');
    closeModal('begin-modal');
  };
  const handleExit = () => handleClose();

  return (
    <Modal
      isDismissable={false}
      hideCloseButton
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      classNames={{
        base: 'bg-neutral rounded-3xl text-neutral-9',
        header: 'border-b-0',
        body: 'py-6',
        footer: 'border-t-0',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-center text-neutral-9 pt-10 pb-0">
          <h2 className="heading-32">Before You Begin</h2>
        </ModalHeader>
        <ModalBody className="px-12 text-left gap-6 text-neutral-9">
          <p className="body-18-semi">
            Kyrah.ai is not a medical, clinical, or emergency service.
          </p>
          <p className="body-18-regular">
            It is designed only to raise awareness of potential emotional risks
            in communication.
          </p>
          <ul className="space-y-3 body-18-regular">
            <li className="list-disc">
              If you are in immediate danger, call{' '}
              <span className="font-semibold">911 (U.S.), 999 (U.K.)</span>, or
              your local emergency number.
            </li>
            <li className="list-disc">
              For confidential support, see our{' '}
              <Link
                href="/resource"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline hover:text-neutral-9"
              >
                Resources & Hotlines
              </Link>
              .
            </li>
            <li className="list-disc">
              By continuing, you confirm you understand this and agree to our{' '}
              <Link
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline hover:text-neutral-9"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline hover:text-neutral-9"
              >
                Privacy Policy
              </Link>
              .
            </li>
          </ul>
        </ModalBody>
        <ModalFooter className="flex flex-col gap-3 pb-8 px-12">
          <Button
            onPress={handleContinue}
            className="bg-neutral-9 text-neutral w-full py-6 body-18-semi rounded-full hover:bg-slate-800"
            size="lg"
          >
            I understand, let&apos;s continue
          </Button>
          <Button
            onPress={handleExit}
            variant="bordered"
            className="border-2 border-neutral-9 text-neutral-9 w-full py-6 body-18-semi rounded-full hover:bg-neutral-1"
            size="lg"
          >
            Exit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
