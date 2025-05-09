import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

// Define a type for the paginated response
interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function useUsers() {
  const { data, isLoading, error } = useQuery<PaginatedResponse<User> | User[]>({
    queryKey: ["/api/users"],
  });

  // Handle both paginated response and direct array response using useMemo for optimization
  const users = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  return {
    users,
    isLoading,
    error
  };
}