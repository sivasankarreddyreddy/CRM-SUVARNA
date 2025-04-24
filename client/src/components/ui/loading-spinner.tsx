import React from "react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ 
  size = "default", 
  className
}: {
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClass = {
    sm: "h-3 w-3",
    default: "h-5 w-5",
    lg: "h-8 w-8"
  };

  return (
    <div className={cn("animate-spin text-primary", sizeClass[size], className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>
  );
}