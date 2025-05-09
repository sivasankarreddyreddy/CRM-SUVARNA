import { useQuery } from "@tanstack/react-query";

// Define a type for the response to help with type safety
interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function useCompanies() {
  const { data, isLoading, error } = useQuery<PaginatedResponse<any> | any[]>({
    queryKey: ["/api/companies"],
  });

  // Handle both paginated response and direct array response
  let companies = [];
  
  if (data) {
    if (Array.isArray(data)) {
      companies = data;
    } else if (data.data && Array.isArray(data.data)) {
      companies = data.data;
    }
  }

  return {
    companies,
    isLoading,
    error,
  };
}