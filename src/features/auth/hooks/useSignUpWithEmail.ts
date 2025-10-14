// src/features/auth/hooks/useSignUpWithEmail.ts

import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export function useSignUpWithEmail() {
    const { signUpWithEmail } = useAuth()
    const router = useRouter()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ email, password }: { email: string, password: string }) => signUpWithEmail(email, password),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['session'] })
            router.push('/mail-confirm')
        }
    })
}
