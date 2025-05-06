import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';

export function useUser() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const res = await fetch('/api/user');
      if (!res.ok) {
        if (res.status === 401) {
          return null;
        }
        throw new Error('Failed to fetch user');
      }
      return await res.json();
    },
    retry: false,
  });

  return { user, isLoading, error };
}