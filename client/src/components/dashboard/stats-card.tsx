import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change: number;
  changeLabel?: string;
  isLoading?: boolean;
}

export function StatsCard({ title, value, icon, change, changeLabel = "vs last month", isLoading }: StatsCardProps) {
  const isPositive = change >= 0;

  return (
    <Card className="dashboard-card transition-transform hover:translate-y-[-2px]">
      <CardContent className="p-5">
        {isLoading ? (
          // Loading state
          <>
            <div className="flex justify-between">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
            <div className="mt-4 flex items-center">
              <Skeleton className="h-4 w-14 mr-2" />
              <Skeleton className="h-3 w-20" />
            </div>
          </>
        ) : (
          // Data state
          <>
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-2xl font-semibold text-slate-800 mt-1">{value}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                {icon}
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? <ArrowUp className="mr-1 h-4 w-4" /> : <ArrowDown className="mr-1 h-4 w-4" />}
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-slate-500 ml-2">{changeLabel}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
