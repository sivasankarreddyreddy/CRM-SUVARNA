import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  MoreVertical, 
  Search, 
  Filter, 
  Download, 
  PackageOpen, 
  FileText, 
  Truck, 
  FileOutput, 
  Copy, 
  AlertTriangle,
  Pencil,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // State for different dialogs and selected order
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isCancelOrderOpen, setIsCancelOrderOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [cancelReason, setCancelReason] = useState<string>("");

  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  // Default orders for initial rendering
  const defaultOrders = [
    { id: 1, orderNumber: "ORD-2023-001", companyName: "Acme Corp", total: "₹12,500.00", status: "pending", orderDate: "2023-07-15", quotationNumber: "QT-2023-001" },
    { id: 2, orderNumber: "ORD-2023-002", companyName: "TechGiant Inc", total: "₹45,000.00", status: "processing", orderDate: "2023-07-14", quotationNumber: "QT-2023-002" },
    { id: 3, orderNumber: "ORD-2023-003", companyName: "SecureData LLC", total: "₹8,750.00", status: "delivered", orderDate: "2023-07-10", quotationNumber: "QT-2023-003" },
    { id: 4, orderNumber: "ORD-2023-004", companyName: "DigiFuture Co", total: "₹18,300.00", status: "completed", orderDate: "2023-07-08", quotationNumber: "QT-2023-004" },
    { id: 5, orderNumber: "ORD-2023-005", companyName: "GlobalTech Inc", total: "₹27,500.00", status: "cancelled", orderDate: "2023-06-25", quotationNumber: "QT-2023-005" },
  ];

  // Type for order item
  type OrderItem = {
    id: number;
    orderNumber: string;
    company?: string;
    companyId?: number;
    companyName?: string;
    total: string;
    status: string;
    orderDate: string;
    quotationId?: number;
    quotationNumber?: string;
    notes?: string;
    subtotal?: string;
    tax?: string;
    discount?: string;
    createdAt?: string;
    createdBy?: number;
    opportunityId?: number;
    contactId?: number;
  };

  // Filter orders based on search query
  const filteredOrders = orders
    ? (orders as OrderItem[]).filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.company && order.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (order.companyName && order.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (order.quotationNumber && order.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : defaultOrders.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.company && order.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (order.companyName && order.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (order.quotationNumber && order.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  // Mutations for order actions
  const updateOrderMutation = useMutation({
    mutationFn: async ({id, data}: {id: number, data: Partial<OrderItem>}) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order updated",
        description: "The order has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order cancelled",
        description: "The order has been successfully cancelled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle order actions
  const handleViewDetails = (order: OrderItem) => {
    setSelectedOrder(order);
    setIsViewDetailsOpen(true);
  };

  const handleEdit = (order: OrderItem) => {
    navigate(`/orders/${order.id}/edit`);
  };

  const handleUpdateStatus = (order: OrderItem) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusUpdateOpen(true);
  };

  const handleStatusSubmit = async () => {
    if (selectedOrder) {
      await updateOrderMutation.mutateAsync({
        id: selectedOrder.id,
        data: { status: newStatus }
      });
      setIsStatusUpdateOpen(false);
    }
  };

  // Add invoice generation mutation
  const generateInvoiceMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiRequest('POST', `/api/orders/${orderId}/generate-invoice`, {});
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Invoice generated",
        description: data.message || "Invoice has been created and can be viewed in the Invoices section.",
      });
      
      // Invalidate both orders and invoices queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      
      setIsCreateInvoiceOpen(false);
      navigate('/invoices');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to generate invoice: ${error.message}`,
        variant: "destructive",
      });
      setIsCreateInvoiceOpen(false);
    },
  });

  const handleCreateInvoice = (order: OrderItem) => {
    setSelectedOrder(order);
    setIsCreateInvoiceOpen(true);
    // Call the API to generate the invoice
    generateInvoiceMutation.mutate(order.id);
  };

  const handleDuplicate = (order: OrderItem) => {
    // Navigate to create order page with prefilled data
    navigate(`/orders/new?duplicate=${order.id}`);
  };

  const handleCancelOrder = (order: OrderItem) => {
    setSelectedOrder(order);
    setCancelReason("");
    setIsCancelOrderOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (selectedOrder) {
      // First update the status to cancelled
      await updateOrderMutation.mutateAsync({
        id: selectedOrder.id,
        data: { 
          status: "cancelled",
          notes: selectedOrder.notes 
            ? `${selectedOrder.notes}\n\nCANCELLATION REASON: ${cancelReason}`
            : `CANCELLATION REASON: ${cancelReason}`
        }
      });
      setIsCancelOrderOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "processing":
        return <Badge variant="default">Processing</Badge>;
      case "quality_check":
        return <Badge variant="outline" className="text-amber-600 border-amber-600">Quality Check</Badge>;
      case "quality_passed":
        return <Badge variant="outline" className="text-emerald-600 border-emerald-600">Quality Check Passed</Badge>;
      case "delivered":
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Delivered</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Orders</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your sales orders and track their status</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button variant="outline" className="inline-flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="inline-flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button className="inline-flex items-center" onClick={() => navigate("/orders/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <Input
              type="text"
              placeholder="Search orders by number, company, or quotation..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Quotation #</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order: OrderItem) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                        <PackageOpen className="h-4 w-4" />
                      </div>
                      {order.orderNumber}
                    </div>
                  </TableCell>
                  <TableCell>{order.quotationNumber || "-"}</TableCell>
                  <TableCell>{order.companyName || order.company || "-"}</TableCell>
                  <TableCell>{order.total}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="View Order Details"
                        onClick={() => handleViewDetails(order)}
                      >
                        <FileText className="h-4 w-4 text-slate-500" />
                      </Button>
                      {order.status === "pending" && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Update Status"
                          onClick={() => handleUpdateStatus(order)}
                        >
                          <Truck className="h-4 w-4 text-slate-500" />
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(order)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Update Status
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => handleCreateInvoice(order)}>
                            <FileOutput className="h-4 w-4 mr-2" />
                            Create Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(order)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleCancelOrder(order)}
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information about the order.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Order Number</h3>
                  <p className="mt-1 text-base font-semibold">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Status</h3>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Order Date</h3>
                  <p className="mt-1">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Total Amount</h3>
                  <p className="mt-1 text-base font-semibold">{selectedOrder.total}</p>
                </div>
              </div>
              
              {selectedOrder.quotationNumber && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Quotation Reference</h3>
                  <p className="mt-1">{selectedOrder.quotationNumber}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-slate-500">Company</h3>
                <p className="mt-1">{selectedOrder.companyName || selectedOrder.company || "-"}</p>
              </div>
              
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Notes</h3>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedOrder.notes}</p>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Subtotal</h3>
                  <p className="mt-1">{selectedOrder.subtotal || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Tax</h3>
                  <p className="mt-1">{selectedOrder.tax || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Discount</h3>
                  <p className="mt-1">{selectedOrder.discount || "-"}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>Close</Button>

            <Button 
              onClick={() => {
                setIsViewDetailsOpen(false);
                if (selectedOrder) handleEdit(selectedOrder);
              }}
            >
              Edit Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusUpdateOpen} onOpenChange={setIsStatusUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the current status of this order.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="order-number">Order Number</Label>
                <div className="mt-1 font-medium">{selectedOrder.orderNumber}</div>
              </div>
              
              <div>
                <Label htmlFor="current-status">Current Status</Label>
                <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
              </div>
              
              <div>
                <Label htmlFor="new-status">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="quality_check">Quality Check</SelectItem>
                    <SelectItem value="quality_passed">Quality Check Passed</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusUpdateOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleStatusSubmit}
              disabled={updateOrderMutation.isPending || (selectedOrder && newStatus === selectedOrder.status)}
            >
              {updateOrderMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>
              Creating invoice from order data...
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-8">
            <RefreshCw className="h-12 w-12 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <AlertDialog open={isCancelOrderOpen} onOpenChange={setIsCancelOrderOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will cancel the order {selectedOrder?.orderNumber}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="cancel-reason">Cancellation Reason</Label>
              <Textarea 
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                className="mt-1"
              />
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleCancelConfirm();
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={updateOrderMutation.isPending || !cancelReason.trim()}
            >
              {updateOrderMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : "Cancel Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
