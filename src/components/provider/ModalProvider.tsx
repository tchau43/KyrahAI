'use client';

import BeginModal from '@/components/modals/BeginModal';
import SafetyNoteModal from '@/components/modals/SafetyNoteModal';
import AuthModal from '@/components/modals/AuthModal';
import MailConfirmModal from '@/components/modals/MailConfirmModal';

export default function ModalProvider() {
  return (
    <>
      <BeginModal />
      <SafetyNoteModal />
      <AuthModal />
      <MailConfirmModal />
    </>
  );
}
