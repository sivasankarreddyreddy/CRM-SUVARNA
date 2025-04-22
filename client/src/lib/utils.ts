import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useMemo } from "react"
import { useLocation } from "wouter"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility hook to parse URL query parameters
export function useQueryParams() {
  const [location] = useLocation();
  
  return useMemo(() => {
    const searchParams = new URLSearchParams(
      location.includes('?') ? location.split('?')[1] : ''
    );
    return searchParams;
  }, [location]);
}
