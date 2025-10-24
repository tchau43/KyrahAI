import { create } from 'zustand';

export type ModalType = 'begin-modal' | 'safety-note-modal' | 'auth-modal' | 'mail-confirm-modal' | 'folder-modal' | 'add-sessions-to-folder-modal';

interface ModalStore {
  openModals: Set<ModalType>;
  openModal: (modal: ModalType) => void;
  closeModal: (modal: ModalType) => void;
  isModalOpen: (modal: ModalType) => boolean;
  authMode: 'signin' | 'signup';
  setAuthMode: (mode: 'signin' | 'signup') => void;
}

export const useModalStore = create<ModalStore>((set, get) => ({
  openModals: new Set(),
  authMode: 'signup',
  openModal: (modal) =>
    set((state) => ({
      openModals: new Set(state.openModals).add(modal),
    })),
  closeModal: (modal) =>
    set((state) => {
      const newSet = new Set(state.openModals);
      newSet.delete(modal);
      return { openModals: newSet };
    }),
  isModalOpen: (modal) => get().openModals.has(modal),
  setAuthMode: (mode) => set(() => ({ authMode: mode })),
}));
