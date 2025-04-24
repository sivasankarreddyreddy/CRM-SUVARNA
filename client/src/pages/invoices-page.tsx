import React, { useState } from 'react';
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
  FileText, 
  Eye, 
  Mail, 
  CreditCard, 
  Download,
  Printer,
  MoreHorizontal,
  Check,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

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

type Invoice = {
  id: number;
  order_number: string;
  invoice_number?: string;
  quotationNumber?: string;
  quotation_number?: string; 
  company_name: string;
  companyName?: string;
  total: string;
  status: string;
  orderDate?: string;
  order_date?: string;
  createdAt?: string;
  created_at?: string;
};

export default function InvoicesPage() {
  const { toast } = useToast();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    email: '',
    message: 'Please find attached the invoice for your recent order.'
  });

  // Fetch invoices
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
    refetchOnWindowFocus: false,
  });

  // Send invoice via email mutation
  const emailMutation = useMutation({
    mutationFn: async ({ id, email, message }: { id: number; email: string; message: string }) => {
      const response = await apiRequest('POST', `/api/invoices/${id}/email`, { email, message });
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
    mutationFn: async (id: number) => {
      const response = await apiRequest('PATCH', `/api/invoices/${id}/mark-paid`, {});
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Invoice Updated',
        description: 'Invoice has been marked as paid',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update invoice: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle email actions
  const handleOpenEmailDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEmailDialogOpen(true);
  };

  const handleSendEmail = () => {
    if (!selectedInvoice || !emailData.email) return;
    
    emailMutation.mutate({
      id: selectedInvoice.id,
      email: emailData.email,
      message: emailData.message
    });
  };

  // Handle print action
  const handlePrintInvoice = (invoice: Invoice) => {
    // Open the PDF in a new window for printing
    window.open(`/api/invoices/${invoice.id}/pdf`, '_blank');
  };

  // Handle download action
  const handleDownloadInvoice = (invoice: Invoice) => {
    // Create a temporary link to download the PDF
    const link = document.createElement('a');
    link.href = `/api/invoices/${invoice.id}/pdf`;
    link.download = `invoice-${invoice.invoice_number || `INV-${invoice.order_number}`}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Invoices</h1>
            <p className="text-gray-600">Manage and view all invoices</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>View and manage invoices for all orders</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <LoadingSpinner />
              </div>
            ) : !invoices || invoices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No invoices found</h3>
                <p className="mt-1 text-gray-500">There are no invoices available yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{invoice.invoice_number || `INV-${invoice.order_number}`}</span>
                            {(invoice.quotationNumber || invoice.quotation_number) && (
                              <span className="text-xs text-gray-500">
                                Quote: {invoice.quotationNumber || invoice.quotation_number}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{invoice.company_name || invoice.companyName}</TableCell>
                        <TableCell>₹{invoice.total}</TableCell>
                        <TableCell>{formatDate(invoice.orderDate || invoice.order_date || invoice.createdAt || invoice.created_at)}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[invoice.status]}>
                            {invoice.status === 'completed' ? 'Paid' : 
                             invoice.status === 'processing' ? 'Unpaid' : 
                             invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/orders/${invoice.id}`} className="flex items-center">
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>View Order</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice)}>
                                <Download className="mr-2 h-4 w-4" />
                                <span>Download PDF</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenEmailDialog(invoice)}>
                                <Mail className="mr-2 h-4 w-4" />
                                <span>Send Via Email</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePrintInvoice(invoice)}>
                                <Printer className="mr-2 h-4 w-4" />
                                <span>Print Invoice</span>
                              </DropdownMenuItem>
                              {invoice.status !== 'completed' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => markAsPaidMutation.mutate(invoice.id)}>
                                    <Check className="mr-2 h-4 w-4" />
                                    <span>Mark as Paid</span>
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
            )}
          </CardContent>
        </Card>
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