import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PipelineStage {
  name: string;
  value: string;
  count: number;
  percentage: number;
  color: string;
}

interface PipelineChartProps {
  stages: PipelineStage[];
  totalValue: string;
  onViewAll?: () => void;
  isLoading?: boolean;
}

export function PipelineChart({ stages, totalValue, onViewAll, isLoading }: PipelineChartProps) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-lg font-semibold text-slate-800">Sales Pipeline</CardTitle>
          <Button variant="link" className="text-primary-600 p-0" onClick={onViewAll}>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4 rounded-md" />
            <Skeleton className="h-10 w-2/3 rounded-md" />
            <Skeleton className="h-10 w-1/2 rounded-md" />
            <Skeleton className="h-10 w-1/3 rounded-md" />
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Pipeline Value</span>
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        ) : stages.length > 0 ? (
          // Data state
          <>
            <div className="space-y-4">
              {stages.map((stage) => (
                <div key={stage.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{stage.name}</span>
                    <span className="text-slate-500">{stage.value}</span>
                  </div>
                  <div 
                    className="relative h-10 rounded-md text-white flex items-center px-3 overflow-hidden" 
                    style={{ 
                      width: `${stage.percentage}%`, 
                      backgroundColor: stage.color,
                    }}
                  >
                    {stage.count} deals
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Pipeline Value</span>
                <span className="text-lg font-semibold text-slate-800">{totalValue}</span>
              </div>
            </div>
          </>
        ) : (
          // Empty state
          <div className="py-8 text-center">
            <p className="text-slate-500">No pipeline data available for the selected period.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
