// src/components/provider/providers.tsx
'use client';

import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { HeroUIProvider } from '@heroui/react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

function RevalidateOnFocus() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const onFocus = async () => {
      try {
        // đảm bảo session sống lại sau khi tab wake
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // cố gắng refresh nếu có refresh_token
          await supabase.auth.refreshSession();
        }
      } finally {
        // buộc refetch toàn bộ queries phụ thuộc auth
        queryClient.invalidateQueries();
      }
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') onFocus();
    });

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onFocus);
    };
  }, [queryClient]);

  return null;
}

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: 2,
            staleTime: 1000 * 60 * 30, // 30 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider>
        <RevalidateOnFocus />
        {children}
      </HeroUIProvider>
    </QueryClientProvider>
  );
}