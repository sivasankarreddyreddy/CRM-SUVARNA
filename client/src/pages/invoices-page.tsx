import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Filter, Search, Download, Plus, 
  ArrowUpDown, FileText, Send, Eye, Printer, 
  MoreVertical, FileOutput, RefreshCw, Copy, CheckCheck
} from "lucide-react";
import { format } from "date-fns";

export default function InvoicesPage() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);

  // Fetch orders that have been converted to invoices
  const { data: invoices } = useQuery({
    queryKey: ["/api/invoices"],
  });

  // Temporary placeholder data
  const defaultInvoices: InvoiceItem[] = [
    { 
      id: 1, 
      invoiceNumber: "INV-2025-001", 
      orderNumber: "ORD-2023-002",
      companyName: "TechGiant Inc", 
      total: "₹45,000.00", 
      status: "paid", 
      issuedDate: "2025-04-22", 
      dueDate: "2025-05-22",
      paidDate: "2025-04-25"
    },
    { 
      id: 2, 
      invoiceNumber: "INV-2025-002", 
      orderNumber: "SO-2025-04440",
      companyName: "KIMS Hospitals", 
      total: "₹1,499.99", 
      status: "unpaid", 
      issuedDate: "2025-04-23", 
      dueDate: "2025-05-23"
    }
  ];

  // Type for invoice item
  type InvoiceItem = {
    id: number;
    invoiceNumber: string;
    orderNumber: string;
    companyName: string;
    total: string;
    status: string;
    issuedDate: string;
    dueDate: string;
    paidDate?: string;
    notes?: string;
  };

  // Filter invoices based on search query
  const filteredInvoices = invoices
    ? (invoices as InvoiceItem[]).filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.companyName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : defaultInvoices.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.companyName.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Handle invoice actions
  const handleViewDetails = (invoice: InvoiceItem) => {
    setSelectedInvoice(invoice);
    setIsViewDetailsOpen(true);
  };

  const handlePrintInvoice = (invoice: InvoiceItem) => {
    window.alert(`Printing invoice ${invoice.invoiceNumber}...`);
  };

  const handleSendEmail = (invoice: InvoiceItem) => {
    window.alert(`Sending invoice ${invoice.invoiceNumber} via email...`);
  };

  const handleMarkAsPaid = (invoice: InvoiceItem) => {
    setSelectedInvoice(invoice);
    setIsMarkPaidOpen(true);
  };

  const handleDownloadPdf = (invoice: InvoiceItem) => {
    window.alert(`Downloading invoice ${invoice.invoiceNumber} as PDF...`);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <Badge variant="outline" className="text-green-600 border-green-600">Paid</Badge>;
      case "unpaid":
        return <Badge variant="secondary">Unpaid</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "partial":
        return <Badge variant="outline" className="text-amber-600 border-amber-600">Partial</Badge>;
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
            <h1 className="text-2xl font-semibold text-slate-800">Invoices</h1>
            <p className="mt-1 text-sm text-slate-500">Manage and track customer invoices</p>
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
            <Button className="inline-flex items-center" onClick={() => navigate("/orders")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice from Order
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <Input
              type="text"
              placeholder="Search invoices by number, company, or order..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Order #</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Issue Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice: InvoiceItem) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                        <FileOutput className="h-4 w-4" />
                      </div>
                      {invoice.invoiceNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-500">{invoice.orderNumber}</span>
                  </TableCell>
                  <TableCell>{invoice.companyName}</TableCell>
                  <TableCell className="font-medium">{invoice.total}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>{format(new Date(invoice.issuedDate), 'dd MMM yyyy')}</TableCell>
                  <TableCell>{format(new Date(invoice.dueDate), 'dd MMM yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View Invoice"
                        onClick={() => handleViewDetails(invoice)}
                      >
                        <Eye className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Print Invoice"
                        onClick={() => handlePrintInvoice(invoice)}
                      >
                        <Printer className="h-4 w-4 text-slate-500" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Invoice Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(invoice)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPdf(invoice)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleSendEmail(invoice)}>
                            <Send className="h-4 w-4 mr-2" />
                            Send via Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrintInvoice(invoice)}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print Invoice
                          </DropdownMenuItem>
                          {invoice.status === 'unpaid' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice)}>
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Mark as Paid
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* View Details Dialog */}
        <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>
                Complete information about the invoice.
              </DialogDescription>
            </DialogHeader>
            
            {selectedInvoice && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Invoice Number</h3>
                    <p className="mt-1 text-base font-semibold">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Status</h3>
                    <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Issued Date</h3>
                    <p className="mt-1">{format(new Date(selectedInvoice.issuedDate), 'dd MMM yyyy')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Due Date</h3>
                    <p className="mt-1">{format(new Date(selectedInvoice.dueDate), 'dd MMM yyyy')}</p>
                  </div>
                </div>
                
                {selectedInvoice.paidDate && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Payment Date</h3>
                    <p className="mt-1">{format(new Date(selectedInvoice.paidDate), 'dd MMM yyyy')}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Order Reference</h3>
                  <p className="mt-1">{selectedInvoice.orderNumber}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Company</h3>
                  <p className="mt-1">{selectedInvoice.companyName}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Total Amount</h3>
                  <p className="mt-1 text-base font-semibold">{selectedInvoice.total}</p>
                </div>
                
                {selectedInvoice.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Notes</h3>
                    <p className="mt-1 text-sm whitespace-pre-wrap">{selectedInvoice.notes}</p>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>
                Close
              </Button>
              {selectedInvoice && (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsViewDetailsOpen(false);
                      handleDownloadPdf(selectedInvoice);
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewDetailsOpen(false);
                      handlePrintInvoice(selectedInvoice);
                    }}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Invoice
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mark as Paid Dialog */}
        <Dialog open={isMarkPaidOpen} onOpenChange={setIsMarkPaidOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Invoice as Paid</DialogTitle>
              <DialogDescription>
                Update the payment status for this invoice.
              </DialogDescription>
            </DialogHeader>
            
            {selectedInvoice && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Invoice Number</h3>
                  <p className="mt-1 font-medium">{selectedInvoice.invoiceNumber}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Company</h3>
                  <p className="mt-1">{selectedInvoice.companyName}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Total Amount</h3>
                  <p className="mt-1 font-medium">{selectedInvoice.total}</p>
                </div>
                
                <div className="bg-green-50 border border-green-100 rounded-md p-4">
                  <p className="text-green-800 text-sm">
                    This will update the invoice status to <strong>Paid</strong> and record today's date as the payment date.
                  </p>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMarkPaidOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Here would be the actual API call to update the invoice
                  window.alert(`Invoice ${selectedInvoice?.invoiceNumber} marked as paid.`);
                  setIsMarkPaidOpen(false);
                }}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Confirm Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}