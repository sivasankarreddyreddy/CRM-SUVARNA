import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

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

  // Handle both paginated response and direct array response using useMemo for optimization
  const companies = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  return {
    companies,
    isLoading,
    error,
  };
}