import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ModalState {
  safetyNoteShown: boolean;
  setSafetyNoteShown: (shown: boolean) => void;
}

export const useModal = create<ModalState>()(
  persist(
    (set) => ({
      safetyNoteShown: false,
      setSafetyNoteShown: (shown: boolean) => set({ safetyNoteShown: shown }),
    }),
    {
      name: 'modal-storage',
    }
  )
);
