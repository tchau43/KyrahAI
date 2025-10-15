// src/app/hooks/prompt/useGetSystemPrompt.ts

import { getSystemPrompt } from "@/app/api/prompt/getSystemPrompt";
import { useQuery } from "@tanstack/react-query";

export const useGetSystemPrompt = () => {
  return useQuery({
    queryKey: ['system-prompt'],
    queryFn: async () => {
      const data = await getSystemPrompt();
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>useGetSystemPrompt data', data);
      return data;
    },
  });
};