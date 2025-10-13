// src/features/auth/hooks/useSignInWithEmail.ts

import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export function useSignInWithEmail() {
    const { signInWithEmail } = useAuth()
    const router = useRouter()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ email, password }: { email: string, password: string }) => signInWithEmail(email, password),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['session'] })
            router.push('/chat')
        }
    })
}
