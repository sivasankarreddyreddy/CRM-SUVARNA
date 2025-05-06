import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useLocation } from "wouter";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "0.00";
  
  // Convert to number and handle string values
  const numValue = typeof value === "string" ? parseFloat(value.replace(/[₹,]/g, '')) : value;
  
  // Check if is a valid number
  if (isNaN(numValue)) return "0.00";
  
  // Format with Indian number format (2 decimal places)
  return numValue.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Helper hook to extract query parameters from the URL
export function useQueryParams() {
  const [location] = useLocation();
  
  // If no location is available, return an empty URLSearchParams
  if (!location) return new URLSearchParams();
  
  // Parse the search params from the URL
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  
  return searchParams;
}

// For backwards compatibility - returns an object instead of URLSearchParams
export function useQueryParamsAsObject() {
  const [location] = useLocation();
  
  // If no location is available, return an empty object
  if (!location) return {};
  
  // Parse the search params from the URL
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  
  // Convert searchParams to a plain object
  const params: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  
  return params;
}