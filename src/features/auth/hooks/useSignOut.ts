// src/features/auth/hooks/useSignOut.ts

import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export function useSignOut() {
    const { signOut } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await signOut();
        },
        onSuccess: () => {
            queryClient.clear();
            router.push('/');
        },
    });
}
