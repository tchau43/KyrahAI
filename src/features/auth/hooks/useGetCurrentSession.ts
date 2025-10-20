// @/features/auth/hooks/useGetCurrentSession.ts

import { getCurrentSession } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

export const useGetCurrentSession = () => {
  return useQuery({
    queryKey: ['current-session'],
    queryFn: async () => {
      const data = await getCurrentSession();
      return data;
    },
  });
};