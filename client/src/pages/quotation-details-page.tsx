import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  FileText,
  Send,
  Download,
  Trash,
  Copy,
  ShoppingCart,
  Mail,
  Phone,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function QuotationDetailsPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch quotation details
  const { data: quotation, isLoading: isLoadingQuotation } = useQuery({
    queryKey: [`/api/quotations/${id}`],
  });

  // Fetch quotation items
  const { data: quotationItems, isLoading: isLoadingItems } = useQuery({
    queryKey: [`/api/quotations/${id}/items`],
  });

  // Handle quotation status update
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await apiRequest("PATCH", `/api/quotations/${id}`, {
        status: newStatus,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quotations/${id}`] });
      toast({
        title: "Quotation updated",
        description: "The quotation status has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating quotation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle quotation deletion
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/quotations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      toast({
        title: "Quotation deleted",
        description: "The quotation has been successfully deleted.",
      });
      navigate("/quotations");
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting quotation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteQuotation = () => {
    if (confirm("Are you sure you want to delete this quotation?")) {
      deleteMutation.mutate();
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    
    switch (status.toLowerCase()) {
      case "draft":
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-700">
            Draft
          </Badge>
        );
      case "sent":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            Sent
          </Badge>
        );
      case "viewed":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-700">
            Viewed
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700">
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700">
            Rejected
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
            Expired
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-700">
            {status}
          </Badge>
        );
    }
  };

  // Display loading skeleton while data is being fetched
  if (isLoadingQuotation || isLoadingItems) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="h-10 w-1/3 bg-slate-200 rounded mb-4"></div>
          <div className="h-6 w-2/3 bg-slate-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Prepare and format data for rendering
  const formattedTotal = quotation?.total
    ? `₹${parseFloat(quotation.total).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "₹0.00";

  const formattedSubtotal = quotation?.subtotal
    ? `₹${parseFloat(quotation.subtotal).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "₹0.00";

  const formattedTax = quotation?.tax
    ? `₹${parseFloat(quotation.tax).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "₹0.00";

  const formattedDiscount = quotation?.discount
    ? `₹${parseFloat(quotation.discount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "₹0.00";

  const createdDate = quotation?.createdAt
    ? new Date(quotation.createdAt).toLocaleDateString()
    : "";

  const validUntilDate = quotation?.validUntil
    ? new Date(quotation.validUntil).toLocaleDateString()
    : "Not specified";

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/quotations")}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">
                Quotation {quotation?.quotationNumber}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Created on {createdDate} • Valid until {validUntilDate}
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            {quotation?.status === "draft" && (
              <Button 
                className="inline-flex items-center" 
                variant="outline"
                onClick={() => updateStatusMutation.mutate("sent")}
              >
                <Send className="mr-2 h-4 w-4" />
                Mark as Sent
              </Button>
            )}
            <Button
              className="inline-flex items-center"
              variant="outline"
              onClick={() => navigate(`/quotations/${id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button 
              className="inline-flex items-center" 
              variant="outline"
              onClick={() => window.open(`/api/quotations/${id}/pdf`, '_blank')}
            >
              <FileText className="mr-2 h-4 w-4" />
              View PDF
            </Button>
            <Button
              className="inline-flex items-center"
              variant="outline"
              onClick={() => navigate(`/quotations/new?duplicate=${id}`)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
            <Button
              className="inline-flex items-center"
              onClick={() => navigate(`/orders/new?quotationId=${id}`)}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Convert to Order
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-500">Status:</span>
            {getStatusBadge(quotation?.status)}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Company Card */}
          <Card className="p-4">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Client Company</h3>
            {quotation?.company ? (
              <>
                <div className="text-lg font-semibold mb-2 flex items-center">
                  {quotation.company.name}
                  <Badge className="ml-2" variant="outline">
                    {quotation.company.industry}
                  </Badge>
                </div>
                <div className="text-sm text-slate-600 mb-3">
                  {quotation.company.address && (
                    <p className="mb-1">{quotation.company.address}</p>
                  )}
                  {quotation.company.website && (
                    <a href={quotation.company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block mb-1">
                      {quotation.company.website}
                    </a>
                  )}
                  {quotation.company.phone && (
                    <p>{quotation.company.phone}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-lg font-semibold mb-2">—</div>
            )}
            <div className="border-t border-slate-200 pt-3 mt-2">
              <div className="text-sm text-slate-600">
                {quotation?.contact ? (
                  <div>
                    <div className="font-medium text-slate-700">Contact Person:</div>
                    <div className="flex items-center">
                      <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center mr-2 font-semibold text-sm">
                        {quotation.contact.firstName?.charAt(0)}{quotation.contact.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{quotation.contact?.firstName} {quotation.contact?.lastName}</div>
                        <div className="text-xs text-slate-500">{quotation.contact?.title || 'Contact'}</div>
                      </div>
                    </div>
                    <div className="mt-2 grid gap-1">
                      {quotation.contact?.email && (
                        <a
                          href={`mailto:${quotation.contact.email}`}
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <Mail className="w-3.5 h-3.5 mr-1.5" /> {quotation.contact.email}
                        </a>
                      )}
                      {quotation.contact?.phone && (
                        <div className="text-slate-600 flex items-center">
                          <Phone className="w-3.5 h-3.5 mr-1.5" /> {quotation.contact.phone}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-400">No contact information</span>
                )}
              </div>
            </div>
            
            {quotation?.opportunity && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="font-medium text-sm text-slate-500 mb-1">Associated Opportunity</div>
                <div className="text-base font-medium mb-1">{quotation.opportunity.name}</div>
                <div className="text-sm text-slate-600 mb-2">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
                    {quotation.opportunity.stage}
                  </span>
                  {quotation.opportunity.value && (
                    <span className="text-slate-500 ml-2">
                      Value: ₹{parseFloat(quotation.opportunity.value).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <a 
                  href={`/opportunities/${quotation.opportunity.id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Opportunity Details
                </a>
              </div>
            )}
          </Card>

          {/* Financials Card */}
          <Card className="p-4">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Amount</h3>
            <div className="text-2xl font-semibold mb-2">{formattedTotal}</div>
            <div className="text-sm text-slate-600">
              <div className="flex justify-between mb-1">
                <span>Subtotal:</span>
                <span>{formattedSubtotal}</span>
              </div>
              {quotation?.tax && parseFloat(quotation.tax) > 0 && (
                <div className="flex justify-between mb-1">
                  <span>Tax:</span>
                  <span>{formattedTax}</span>
                </div>
              )}
              {quotation?.discount && parseFloat(quotation.discount) > 0 && (
                <div className="flex justify-between mb-1">
                  <span>Discount:</span>
                  <span>-{formattedDiscount}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Meta Info Card */}
          <Card className="p-4">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Details</h3>
            <div className="text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-slate-600">Quotation #:</span>
                <span className="font-medium">{quotation?.quotationNumber}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-600">Created by:</span>
                <span className="font-medium">Admin User</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-600">Created on:</span>
                <span className="font-medium">{createdDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Valid until:</span>
                <span className="font-medium">{validUntilDate}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="items" className="mb-6">
          <TabsList>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Items Tab */}
          <TabsContent value="items" className="pt-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="w-[100px] text-right">Qty</TableHead>
                    <TableHead className="w-[150px] text-right">Unit Price</TableHead>
                    <TableHead className="w-[100px] text-right">Tax</TableHead>
                    <TableHead className="w-[150px] text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotationItems && quotationItems.length > 0 ? (
                    quotationItems.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.description}</div>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          ₹{parseFloat(item.unitPrice).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{parseFloat(item.tax || 0).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{parseFloat(item.subtotal).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-slate-500">
                        No items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                {quotation && (
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        Subtotal
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formattedSubtotal}
                      </TableCell>
                    </TableRow>
                    {quotation.tax && parseFloat(quotation.tax) > 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-medium">
                          Tax
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formattedTax}
                        </TableCell>
                      </TableRow>
                    )}
                    {quotation.discount && parseFloat(quotation.discount) > 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-medium">
                          Discount
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          -{formattedDiscount}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium text-lg">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        {formattedTotal}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="pt-4">
            <Card className="p-4">
              <h3 className="text-sm font-medium text-slate-500 mb-2">Notes</h3>
              <div className="text-slate-700 whitespace-pre-wrap">
                {quotation?.notes ? (
                  quotation.notes
                ) : (
                  <span className="text-slate-400">No notes for this quotation</span>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Button */}
        <div className="mt-8 border-t pt-6">
          <Button
            variant="destructive"
            className="inline-flex items-center"
            onClick={handleDeleteQuotation}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Quotation
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}