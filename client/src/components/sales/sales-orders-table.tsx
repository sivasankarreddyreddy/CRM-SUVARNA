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
import { 
  CreditCard, 
  Download, 
  Edit, 
  Eye, 
  FileText, 
  MoreHorizontal, 
  ShoppingCart, 
  Truck, 
  Trash 
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

interface SalesOrdersTableProps {
  salesOrders: any[];
  onUpdate: () => void;
}

export function SalesOrdersTable({ salesOrders, onUpdate }: SalesOrdersTableProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  
  const canEdit = user?.role === 'admin' || user?.role === 'sales_manager';
  
  // Delete sales order mutation
  const deleteSalesOrder = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/sales-orders/${id}`);
      if (!res.ok) {
        throw new Error("Failed to delete sales order");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-orders'] });
      toast({
        title: "Sales order deleted",
        description: "The sales order has been removed successfully",
      });
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete sales order: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });
  
  // Update status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/sales-orders/${id}`, {
        status,
      });
      if (!res.ok) {
        throw new Error("Failed to update sales order status");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-orders'] });
      toast({
        title: "Status updated",
        description: "The sales order status has been updated",
      });
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update status: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });
  
  // Generate Invoice PDF mutation
  const generateInvoicePdf = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("GET", `/api/sales-orders/${id}/invoice-pdf`);
      if (!res.ok) {
        throw new Error("Failed to generate invoice PDF");
      }
      
      // Convert response to blob and create download link
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "Invoice Generated",
        description: "The invoice PDF has been downloaded",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate invoice: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  // Handle status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'delivered':
        return 'bg-green-500';
      case 'completed':
        return 'bg-emerald-500';
      case 'cancelled':
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

  if (salesOrders.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center">
        <h3 className="font-medium">No sales orders found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or create a new sales order.
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
              <TableHead>Order #</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>{order.companyName}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  {order.createdAt 
                    ? format(new Date(order.createdAt), 'dd MMM yyyy')
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
                      <DropdownMenuItem onClick={() => navigate(`/sales-orders/${order.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => generateInvoicePdf.mutate(order.id)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Invoice
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {canEdit && (
                        <>
                          <DropdownMenuItem onClick={() => navigate(`/sales-orders/edit/${order.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Order
                          </DropdownMenuItem>
                          {order.status === 'New' && (
                            <DropdownMenuItem 
                              onClick={() => updateStatus.mutate({ id: order.id, status: 'Processing' })}
                            >
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Mark as Processing
                            </DropdownMenuItem>
                          )}
                          {order.status === 'Processing' && (
                            <DropdownMenuItem 
                              onClick={() => updateStatus.mutate({ id: order.id, status: 'Delivered' })}
                            >
                              <Truck className="mr-2 h-4 w-4" />
                              Mark as Delivered
                            </DropdownMenuItem>
                          )}
                          {order.status === 'Delivered' && (
                            <DropdownMenuItem 
                              onClick={() => updateStatus.mutate({ id: order.id, status: 'Completed' })}
                            >
                              <CreditCard className="mr-2 h-4 w-4" />
                              Mark as Completed
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setOrderToDelete(order.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Order
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
      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the sales order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (orderToDelete) {
                  deleteSalesOrder.mutate(orderToDelete);
                  setOrderToDelete(null);
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