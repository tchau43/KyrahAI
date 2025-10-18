'use client';

import { getSystemPrompt } from "@/lib/prompt/getSystemPrompt";
import { useQuery } from "@tanstack/react-query";

export const useGetSystemPrompt = () => {
  return useQuery({
    queryKey: ['system-prompt'],
    queryFn: async () => {
      const data = await getSystemPrompt();
      return data;
    },
  });
};