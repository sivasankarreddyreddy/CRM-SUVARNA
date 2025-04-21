import { useQuery } from "@tanstack/react-query";

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

export function useUsers() {
  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  return {
    users,
    isLoading,
    error
  };
}