import { useAuth } from "@/contexts/AuthContext";
import { getFolders } from "@/lib/chat";
import { useQuery } from "@tanstack/react-query";

export const useGetFolders = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['user-folders', user?.id],
    queryFn: async () => {
      const data = await getFolders();
      return data;
    },
    enabled: !!user?.id,
    // staleTime: 30000, // Cache for 30 seconds
  });
};
