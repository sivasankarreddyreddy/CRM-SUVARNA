import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const options = {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include" as RequestCredentials, // Explicitly type as RequestCredentials
  };

  try {
    const res = await fetch(url, options);
    
    // If authorization error and we have login credentials in localStorage, attempt to re-login
    if (res.status === 401) {
      console.log("Authentication error - user needs to login");
    }
    
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API request error (${method} ${url}):`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Add cache-busting parameter to avoid browser caching
      const url = new URL(queryKey[0] as string, window.location.origin);
      const cacheBuster = `_t=${Date.now()}`;
      url.search = url.search ? `${url.search}&${cacheBuster}` : `?${cacheBuster}`;
      
      const res = await fetch(url.toString(), {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log("Auth required for", url.toString());
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error(`Query error (${queryKey[0]}):`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Changed to true to refresh data when window focus changes
      staleTime: 60000, // Set to 1 minute instead of Infinity to allow refreshes
      retry: 1, // Add one retry attempt
    },
    mutations: {
      retry: false,
    },
  },
});
