'use client';

const MODAL_STORAGE_KEY = 'safety-note-modal-seen';
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export function useModalState() {
  const checkIfModalSeen = (): boolean => {
    if (typeof window === 'undefined') return false;

    const stored = localStorage.getItem(MODAL_STORAGE_KEY);
    if (!stored) return false;

    try {
      const { timestamp } = JSON.parse(stored);
      const now = Date.now();

      // Check if 1 month has passed
      if (now - timestamp > ONE_MONTH_MS) {
        localStorage.removeItem(MODAL_STORAGE_KEY);
        return false;
      }

      return true;
    } catch {
      localStorage.removeItem(MODAL_STORAGE_KEY);
      return false;
    }
  };

  const setModalSeen = () => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(
      MODAL_STORAGE_KEY,
      JSON.stringify({ timestamp: Date.now() })
    );
  };

  return {
    checkIfModalSeen,
    setModalSeen,
  };
}
