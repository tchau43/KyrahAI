'use client';

import BeginModal from '@/components/modals/BeginModal';
import SafetyNoteModal from '@/components/modals/SafetyNoteModal';

export default function ModalProvider() {
  return (
    <>
      <BeginModal />
      <SafetyNoteModal />
    </>
  );
}
