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
import { CheckSquare, Download, Edit, Eye, FileText, MoreHorizontal, Trash } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

interface QuotationsTableProps {
  quotations: any[];
  onUpdate: () => void;
}

export function QuotationsTable({ quotations, onUpdate }: QuotationsTableProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [quotationToDelete, setQuotationToDelete] = useState<number | null>(null);
  
  const canEdit = user?.role === 'admin' || user?.role === 'sales_manager';
  
  // Delete quotation mutation
  const deleteQuotation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/quotations/${id}`);
      if (!res.ok) {
        throw new Error("Failed to delete quotation");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotations'] });
      toast({
        title: "Quotation deleted",
        description: "The quotation has been removed successfully",
      });
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete quotation: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });
  
  // Mark as accepted mutation
  const acceptQuotation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/quotations/${id}`, {
        status: "Accepted",
      });
      if (!res.ok) {
        throw new Error("Failed to update quotation status");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotations'] });
      toast({
        title: "Quotation accepted",
        description: "The quotation has been marked as accepted",
      });
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update quotation: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });
  
  // Generate PDF mutation
  const generatePdf = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("GET", `/api/quotations/${id}/pdf`);
      if (!res.ok) {
        throw new Error("Failed to generate PDF");
      }
      
      // Convert response to blob and create download link
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quotation-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "PDF Generated",
        description: "The quotation PDF has been downloaded",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate PDF: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });
  
  // Convert to Sales Order mutation
  const convertToSalesOrder = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/quotations/${id}/convert-to-order`, {});
      if (!res.ok) {
        throw new Error("Failed to convert to sales order");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales-orders'] });
      toast({
        title: "Conversion successful",
        description: "Quotation has been converted to a sales order",
      });
      onUpdate();
      
      // Navigate to the new sales order
      if (data && data.id) {
        navigate(`/sales-orders/${data.id}`);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to convert to sales order: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  // Handle status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-gray-500';
      case 'sent':
        return 'bg-blue-500';
      case 'accepted':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'expired':
        return 'bg-orange-500';
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

  if (quotations.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center">
        <h3 className="font-medium">No quotations found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or create a new quotation.
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
              <TableHead>Quotation #</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations.map((quotation) => (
              <TableRow key={quotation.id}>
                <TableCell className="font-medium">{quotation.quotationNumber}</TableCell>
                <TableCell>{quotation.companyName}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(quotation.status)}>
                    {quotation.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(quotation.total)}</TableCell>
                <TableCell>
                  {quotation.validUntil 
                    ? format(new Date(quotation.validUntil), 'dd MMM yyyy')
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
                      <DropdownMenuItem onClick={() => navigate(`/quotations/${quotation.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => generatePdf.mutate(quotation.id)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {canEdit && (
                        <>
                          <DropdownMenuItem onClick={() => navigate(`/quotations/edit/${quotation.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Quotation
                          </DropdownMenuItem>
                          {quotation.status === 'Sent' && (
                            <DropdownMenuItem onClick={() => acceptQuotation.mutate(quotation.id)}>
                              <CheckSquare className="mr-2 h-4 w-4" />
                              Mark as Accepted
                            </DropdownMenuItem>
                          )}
                          {quotation.status === 'Accepted' && (
                            <DropdownMenuItem onClick={() => convertToSalesOrder.mutate(quotation.id)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Convert to Order
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setQuotationToDelete(quotation.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Quotation
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
      <AlertDialog open={!!quotationToDelete} onOpenChange={(open) => !open && setQuotationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the quotation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (quotationToDelete) {
                  deleteQuotation.mutate(quotationToDelete);
                  setQuotationToDelete(null);
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