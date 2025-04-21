import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export type UserData = {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
};

export function useUsers() {
  const { toast } = useToast();
  
  const {
    data: users,
    isLoading,
    error,
  } = useQuery<UserData[], Error>({
    queryKey: ['/api/users'],
    retry: 1,
  });

  return {
    users: users || [],
    isLoading,
    error,
  };
}