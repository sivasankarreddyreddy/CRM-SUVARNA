import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Mail, 
  Printer, 
  Clock, 
  Check, 
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
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

// Inline LoadingSpinner component
function LoadingSpinner({ 
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
    <Loader2
      className={cn(
        "animate-spin text-primary",
        sizeClass[size],
        className
      )}
    />
  );
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  pending: 'bg-orange-500',
  processing: 'bg-blue-500', 
  completed: 'bg-green-500',
  cancelled: 'bg-red-500'
};

type InvoiceItem = {
  id: number;
  order_id?: number;
  orderId?: number;
  product_id?: number;
  productId?: number;
  product_name?: string;
  productName?: string;
  quantity: string;
  unit_price?: string;
  unitPrice?: string;
  line_total: string;
};

type Invoice = {
  id: number;
  order_number: string;
  invoice_number?: string;
  quotation_number?: string;
  company_name?: string;
  companyName?: string;
  company_id?: number;
  companyId?: number;
  contact_id?: number;
  contactId?: number;
  contact_name?: string;
  contactName?: string;
  total: string;
  subtotal: string;
  tax?: string;
  discount?: string;
  status: string;
  notes?: string;
  orderDate?: string;
  order_date?: string;
  invoice_date?: string;
  invoiceDate?: string;
  payment_date?: string;
  paymentDate?: string;
  items?: InvoiceItem[];
};

export default function InvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    email: '',
    message: 'Please find attached the invoice for your recent order.'
  });

  // Fetch invoice details
  const { 
    data: invoice, 
    isLoading 
  } = useQuery<Invoice>({
    queryKey: [`/api/invoices/${id}`],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/invoices/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch invoice details");
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching invoice:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
  });

  // Fetch invoice items
  const { 
    data: items,
    isLoading: isLoadingItems
  } = useQuery<InvoiceItem[]>({
    queryKey: [`/api/sales-orders/${id}/items`],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/sales-orders/${id}/items`);
        if (!res.ok) {
          throw new Error("Failed to fetch invoice items");
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching invoice items:", error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    enabled: !!id
  });

  // Send invoice via email mutation
  const emailMutation = useMutation({
    mutationFn: async ({ invoiceId, email, message }: { invoiceId: number; email: string; message: string }) => {
      const response = await apiRequest('POST', `/api/invoices/${invoiceId}/email`, { email, message });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Email Sent',
        description: 'Invoice has been sent successfully',
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

  // Mark invoice as paid mutation
  const markAsPaidMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await apiRequest('PATCH', `/api/invoices/${invoiceId}/mark-paid`, {});
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Invoice Updated',
        description: 'Invoice has been marked as paid',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/invoices/${id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update invoice: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle download action
  const handleDownloadInvoice = () => {
    if (!invoice) return;
    
    // Create a temporary link to download the PDF
    const link = document.createElement('a');
    link.href = `/api/invoices/${invoice.id}/pdf`;
    link.download = `invoice-${invoice.invoice_number || `INV-${invoice.order_number}`}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle print action
  const handlePrintInvoice = () => {
    if (!invoice) return;
    
    // Open the PDF in a new window for printing
    window.open(`/api/invoices/${invoice.id}/pdf`, '_blank');
  };

  // Handle email actions
  const handleOpenEmailDialog = () => {
    setIsEmailDialogOpen(true);
  };

  const handleSendEmail = () => {
    if (!invoice || !emailData.email) return;
    
    emailMutation.mutate({
      invoiceId: invoice.id,
      email: emailData.email,
      message: emailData.message
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6 flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <Link to="/invoices">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Invoices
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium">Invoice not found</h3>
                <p className="mt-1 text-gray-500">The requested invoice could not be found.</p>
                <Button className="mt-4" asChild>
                  <Link to="/invoices">View All Invoices</Link>
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
          <Link to="/invoices">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Button>
          </Link>
        </div>

        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Invoice #{invoice.invoice_number || `INV-${invoice.order_number}`}</h1>
            <p className="text-gray-600">
              {invoice.company_name || invoice.companyName || 'Client'} • {formatDate(invoice.invoice_date || invoice.invoiceDate || invoice.order_date || invoice.orderDate)}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleDownloadInvoice}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" onClick={handlePrintInvoice}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleOpenEmailDialog}>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
            {invoice.status !== 'completed' && (
              <Button onClick={() => markAsPaidMutation.mutate(invoice.id)} disabled={markAsPaidMutation.isPending}>
                {markAsPaidMutation.isPending ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Mark as Paid
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Invoice Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Badge className={statusColors[invoice.status]}>
                  {invoice.status === 'completed' ? 'Paid' : 
                    invoice.status === 'processing' ? 'Unpaid' : 
                    invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Badge>
                {invoice.status === 'completed' && (
                  <CheckCircle2 className="h-4 w-4 text-green-500 ml-2" />
                )}
                {invoice.status === 'processing' && (
                  <Clock className="h-4 w-4 text-blue-500 ml-2" />
                )}
              </div>
              {invoice.payment_date || invoice.paymentDate ? (
                <p className="mt-2 text-sm text-gray-500">
                  Paid on: {formatDate(invoice.payment_date || invoice.paymentDate)}
                </p>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  {invoice.status === 'completed' ? 'Payment received' : 'Payment pending'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice Number</span>
                  <span className="font-medium">{invoice.invoice_number || `INV-${invoice.order_number}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Number</span>
                  <span className="font-medium">{invoice.order_number}</span>
                </div>
                {(invoice.quotation_number) && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quotation Number</span>
                    <span className="font-medium">{invoice.quotation_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Date Issued</span>
                  <span className="font-medium">{formatDate(invoice.invoice_date || invoice.invoiceDate || invoice.order_date || invoice.orderDate)}</span>
                </div>
              </div>
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
                  <span className="font-medium">{invoice.company_name || invoice.companyName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contact</span>
                  <span className="font-medium">{invoice.contact_name || invoice.contactName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Date</span>
                  <span className="font-medium">{formatDate(invoice.order_date || invoice.orderDate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Invoice Items</CardTitle>
            <CardDescription>Details of products and services included in this invoice</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingItems ? (
              <div className="flex justify-center p-8">
                <LoadingSpinner />
              </div>
            ) : (!items || items.length === 0) ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No items available for this invoice.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Product</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">Quantity</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">Unit Price</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm">{item.product_name || item.productName}</td>
                        <td className="py-3 px-4 text-sm text-right">{item.quantity}</td>
                        <td className="py-3 px-4 text-sm text-right">₹{item.unit_price || item.unitPrice}</td>
                        <td className="py-3 px-4 text-sm text-right font-medium">₹{item.line_total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Section */}
        <div className="flex flex-col md:flex-row md:justify-between gap-6">
          {/* Notes */}
          <Card className="md:w-1/2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                {invoice.notes || 'No additional notes for this invoice.'}
              </p>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card className="md:w-1/2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₹{invoice.subtotal}</span>
                </div>
                {invoice.tax && parseFloat(invoice.tax) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span>₹{invoice.tax}</span>
                  </div>
                )}
                {invoice.discount && parseFloat(invoice.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span>-₹{invoice.discount}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-lg">₹{invoice.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Related Links */}
        <div className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Related Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/orders/${invoice.id}`}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    View Original Order
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
            <DialogTitle>Send Invoice via Email</DialogTitle>
            <DialogDescription>
              Send this invoice to the client via email.
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
                placeholder="Enter an optional message to include with the invoice"
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