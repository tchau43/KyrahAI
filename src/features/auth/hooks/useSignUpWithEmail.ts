// src/features/auth/hooks/useSignUpWithEmail.ts

import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useModalStore } from '@/store/useModalStore';

export function useSignUpWithEmail() {
  const { signUpWithEmail } = useAuth()
  const queryClient = useQueryClient()
  const { closeModal, openModal } = useModalStore()

  return useMutation({
    mutationFn: ({ email, password }: { email: string, password: string }) => signUpWithEmail(email, password),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
      // Close auth modal and open mail confirm modal
      closeModal('auth-modal')
      openModal('mail-confirm-modal')
    }
  })
}
