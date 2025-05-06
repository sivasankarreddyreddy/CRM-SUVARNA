import React, { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Edit, Eye, FileText, MoreHorizontal, Trash } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

interface OpportunitiesTableProps {
  opportunities: any[];
  onUpdate: () => void;
}

export function OpportunitiesTable({ opportunities, onUpdate }: OpportunitiesTableProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [opportunityToDelete, setOpportunityToDelete] = useState<number | null>(null);
  
  const canEdit = user?.role === 'admin' || user?.role === 'sales_manager';
  
  // Delete opportunity mutation
  const deleteOpportunity = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/opportunities/${id}`);
      if (!res.ok) {
        throw new Error("Failed to delete opportunity");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      toast({
        title: "Opportunity deleted",
        description: "The opportunity has been removed successfully",
      });
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete opportunity: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  // Handle stage badge color
  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'qualification':
        return 'bg-blue-500';
      case 'needs analysis':
        return 'bg-indigo-500';
      case 'proposal':
        return 'bg-violet-500';
      case 'negotiation':
        return 'bg-purple-500';
      case 'closed won':
        return 'bg-green-500';
      case 'closed lost':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Format currency
  const formatCurrency = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return "₹0";
    
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  if (opportunities.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center">
        <h3 className="font-medium">No opportunities found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or create a new opportunity.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Expected Close</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.map((opportunity) => (
              <TableRow key={opportunity.id}>
                <TableCell className="font-medium">{opportunity.name}</TableCell>
                <TableCell>{opportunity.companyName}</TableCell>
                <TableCell>
                  <Badge className={getStageColor(opportunity.stage)}>
                    {opportunity.stage}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(opportunity.value)}</TableCell>
                <TableCell>
                  {opportunity.expectedCloseDate 
                    ? format(new Date(opportunity.expectedCloseDate), 'dd MMM yyyy')
                    : 'Not set'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigate(`/opportunities/${opportunity.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/opportunities/${opportunity.id}/quotations`)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Quotations
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {canEdit && (
                        <>
                          <DropdownMenuItem onClick={() => navigate(`/opportunities/edit/${opportunity.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Opportunity
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setOpportunityToDelete(opportunity.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Opportunity
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!opportunityToDelete} onOpenChange={(open) => !open && setOpportunityToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the opportunity and all associated records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (opportunityToDelete) {
                  deleteOpportunity.mutate(opportunityToDelete);
                  setOpportunityToDelete(null);
                }
              }}
              className="bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}