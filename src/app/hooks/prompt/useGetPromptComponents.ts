// src/app/hooks/prompt/useGetPromptComponents.ts

import { getPromptComponents } from "@/lib/prompt/getPromptComponents";
import { useQuery } from "@tanstack/react-query";

export const useGetPromptComponents = () => {
  return useQuery({
    queryKey: ['prompt-components'],
    queryFn: async () => {
      const data = await getPromptComponents();
      return data;
    },
  });
}