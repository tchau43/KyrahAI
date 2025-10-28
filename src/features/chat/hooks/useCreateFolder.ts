import { useAuth } from "@/contexts/AuthContext";
import { createFolder } from "@/lib/chat";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateFolder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (folderName: string) => {
      const data = await createFolder(folderName);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-folders', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-sessions', user?.id] });
    },
  });
};

