import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface LeadSource {
  name: string;
  percentage: number;
  color: string;
}

interface LeadSourcesProps {
  sources: LeadSource[];
  onViewDetails?: () => void;
  isLoading?: boolean;
}

export function LeadSources({ sources, onViewDetails, isLoading }: LeadSourcesProps) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-lg font-semibold text-slate-800">Lead Sources</CardTitle>
          <Button variant="link" className="text-primary-600 p-0" onClick={onViewDetails}>
            Details
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          {isLoading ? (
            // Loading state
            Array(4).fill(0).map((_, index) => (
              <div key={`skeleton-${index}`}>
                <div className="flex justify-between text-sm mb-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="w-full h-2 rounded-full" />
              </div>
            ))
          ) : sources.length > 0 ? (
            // Data state
            sources.map((source) => (
              <div key={source.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{source.name}</span>
                  <span className="text-slate-500">{source.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${source.percentage}%`,
                      backgroundColor: source.color,
                    }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            // Empty state
            <div className="py-6 text-center text-slate-500">
              No lead source data available.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
