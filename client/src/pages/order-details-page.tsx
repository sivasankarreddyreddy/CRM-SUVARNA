import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  FileText, 
  Printer,
  Mail,
  CreditCard,
  Download,
  CheckCircle2,
  Clock,
  IndianRupee
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

// Inline LoadingSpinner component
function LoadingSpinner({ 
  size = "default", 
  className = ""
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
    <Loader2
      className={`animate-spin text-primary ${sizeClass[size]} ${className}`}
    />
  );
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  pending: 'bg-orange-500',
  processing: 'bg-blue-500', 
  delivered: 'bg-green-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500'
};

type OrderItem = {
  id: number;
  productId: number;
  productName?: string;
  description: string;
  quantity: number;
  unitPrice: string;
  tax?: string;
  subtotal: string;
};

type Order = {
  id: number;
  orderNumber: string;
  order_number?: string;
  quotationId?: number;
  quotation_id?: number;
  quotationNumber?: string;
  quotation_number?: string;
  opportunityId?: number;
  opportunity_id?: number;
  companyId?: number;
  company_id?: number;
  companyName?: string;
  company_name?: string;
  contactId?: number;
  contact_id?: number;
  contactName?: string;
  contact_name?: string;
  subtotal: string;
  tax?: string;
  discount?: string;
  total: string;
  status: string;
  orderDate?: string;
  order_date?: string;
  notes?: string;
  items?: OrderItem[];
};

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    email: '',
    message: 'Please find attached the sales order for your recent purchase.'
  });

  // Fetch order details
  const { 
    data: order, 
    isLoading 
  } = useQuery<Order>({
    queryKey: [`/api/orders/${id}`],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/orders/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch order details");
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching order:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
  });

  // Fetch order items
  const { 
    data: items,
    isLoading: isLoadingItems
  } = useQuery<OrderItem[]>({
    queryKey: [`/api/orders/${id}/items`],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/orders/${id}/items`);
        if (!res.ok) {
          throw new Error("Failed to fetch order items");
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching order items:", error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    enabled: !!id
  });

  // Send order via email mutation
  const emailMutation = useMutation({
    mutationFn: async ({ orderId, email, message }: { orderId: number; email: string; message: string }) => {
      const response = await apiRequest('POST', `/api/orders/${orderId}/email`, { email, message });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Email Sent',
        description: 'Order has been sent successfully',
      });
      setIsEmailDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to send email: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/orders/${orderId}`, { status });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Order Updated',
        description: 'Order status has been updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update order: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle download action
  const handleDownloadOrder = () => {
    if (!order) return;
    
    // Create a temporary link to download the PDF
    const link = document.createElement('a');
    link.href = `/api/orders/${order.id}/pdf`;
    link.download = `order-${order.orderNumber || order.order_number}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle print action
  const handlePrintOrder = () => {
    if (!order) return;
    
    // Open the PDF in a new window for printing
    window.open(`/api/orders/${order.id}/pdf`, '_blank');
  };

  // Handle email actions
  const handleOpenEmailDialog = () => {
    setIsEmailDialogOpen(true);
  };

  const handleSendEmail = () => {
    if (!order || !emailData.email) return;
    
    emailMutation.mutate({
      orderId: order.id,
      email: emailData.email,
      message: emailData.message
    });
  };

  // Handle status update
  const handleUpdateStatus = (status: string) => {
    if (!order) return;
    
    updateStatusMutation.mutate({
      orderId: order.id,
      status
    });
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  // Calculate totals
  const calculateTotal = (items: OrderItem[] = []) => {
    return items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <Link to="/orders">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium">Order not found</h3>
                <p className="mt-1 text-gray-500">The requested order could not be found.</p>
                <Button className="mt-4" asChild>
                  <Link to="/orders">View All Orders</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
        </div>

        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.orderNumber || order.order_number}</h1>
            <p className="text-gray-600">
              {order.companyName || order.company_name || 'Client'} • {formatDate(order.orderDate || order.order_date)}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleDownloadOrder}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" onClick={handlePrintOrder}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleOpenEmailDialog}>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
            {order.status === 'pending' && (
              <Button onClick={() => handleUpdateStatus('processing')}>
                Mark as Processing
              </Button>
            )}
            {order.status === 'processing' && (
              <Button onClick={() => handleUpdateStatus('delivered')}>
                Mark as Delivered
              </Button>
            )}
            {order.status === 'delivered' && (
              <Button onClick={() => handleUpdateStatus('completed')}>
                Mark as Completed
              </Button>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Badge className={statusColors[order.status]}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
                {order.status === 'completed' && (
                  <CheckCircle2 className="h-4 w-4 text-green-500 ml-2" />
                )}
                {order.status === 'processing' && (
                  <Clock className="h-4 w-4 text-blue-500 ml-2" />
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {order.status === 'completed' 
                  ? 'This order has been completed' 
                  : order.status === 'delivered'
                  ? 'This order has been delivered'
                  : order.status === 'processing'
                  ? 'This order is being processed'
                  : order.status === 'pending'
                  ? 'This order is pending processing'
                  : 'Order status: ' + order.status}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Company</span>
                  <span className="font-medium">{order.companyName || order.company_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contact</span>
                  <span className="font-medium">{order.contactName || order.contact_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Date</span>
                  <span className="font-medium">{formatDate(order.orderDate || order.order_date)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Number</span>
                  <span className="font-medium">{order.orderNumber || order.order_number}</span>
                </div>
                {(order.quotationNumber || order.quotation_number) && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quotation Number</span>
                    <span className="font-medium">{order.quotationNumber || order.quotation_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Amount</span>
                  <span className="font-medium">₹{order.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>Items included in this order</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingItems ? (
              <div className="flex justify-center p-4">
                <LoadingSpinner />
              </div>
            ) : !items || items.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">No items found for this order.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productName || `Product #${item.productId}`}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">₹{item.unitPrice}</TableCell>
                        <TableCell className="text-right">₹{item.subtotal}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-end pt-6">
            <div className="w-full max-w-md">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.tax && parseFloat(order.tax) > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tax</span>
                  <span>₹{order.tax}</span>
                </div>
              )}
              {order.discount && parseFloat(order.discount) > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Discount</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between py-2 font-bold">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Notes Section */}
        {order.notes && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Related Links */}
        <div className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Related Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {order.quotationId && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/quotations/${order.quotationId}`}>
                      <FileText className="mr-2 h-4 w-4" />
                      View Quotation
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/invoices/${order.id}`}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    View Invoice
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Order via Email</DialogTitle>
            <DialogDescription>
              Send this order to the client via email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                value={emailData.email}
                onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                placeholder="client@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                placeholder="Enter an optional message to include with the order"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSendEmail} 
              disabled={emailMutation.isPending || !emailData.email}
            >
              {emailMutation.isPending ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Sending...
                </>
              ) : (
                'Send Email'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}