import React from "react";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Opportunity {
  id: number;
  name: string;
  company: string;
  stage: "qualification" | "proposal" | "negotiation" | "closing" | "won" | "lost";
  value: string;
  updatedAt: string;
}

interface RecentOpportunitiesProps {
  opportunities: Opportunity[];
  onViewAll?: () => void;
  isLoading?: boolean;
}

export function RecentOpportunities({ opportunities, onViewAll, isLoading }: RecentOpportunitiesProps) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-lg font-semibold text-slate-800">Recent Opportunities</CardTitle>
          <Button variant="link" className="text-primary-600 p-0" onClick={onViewAll}>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stage</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {isLoading ? (
                // Loading skeleton rows
                Array(4).fill(0).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Skeleton className="h-5 w-32" />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </td>
                  </tr>
                ))
              ) : opportunities.length > 0 ? (
                // Data rows
                opportunities.map((opportunity) => (
                  <tr key={opportunity.id} className="hover:bg-slate-50">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">{opportunity.name}</div>
                      <div className="text-xs text-slate-500">Updated {opportunity.updatedAt}</div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="text-sm text-slate-800">{opportunity.company}</div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Badge variant={opportunity.stage}>{opportunity.stage.charAt(0).toUpperCase() + opportunity.stage.slice(1)}</Badge>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-slate-800">
                      {opportunity.value}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-slate-800">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Link href={`/opportunities/${opportunity.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Create Quotation</DropdownMenuItem>
                          <DropdownMenuItem>Convert to Order</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                // Empty state
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                    No opportunities found for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
