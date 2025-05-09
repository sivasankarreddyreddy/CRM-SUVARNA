import { useQuery } from "@tanstack/react-query";

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

  // Handle both paginated response and direct array response
  let users: User[] = [];
  
  if (data) {
    if (Array.isArray(data)) {
      users = data;
    } else if (data.data && Array.isArray(data.data)) {
      users = data.data;
    }
  }

  return {
    users,
    isLoading,
    error
  };
}