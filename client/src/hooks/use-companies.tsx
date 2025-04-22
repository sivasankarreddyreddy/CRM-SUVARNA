import { useQuery } from "@tanstack/react-query";

export function useCompanies() {
  const { data: companies, isLoading, error } = useQuery({
    queryKey: ["/api/companies"],
  });

  return {
    companies: companies || [],
    isLoading,
    error,
  };
}