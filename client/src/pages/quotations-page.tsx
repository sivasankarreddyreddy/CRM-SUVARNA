import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
import { Plus, MoreVertical, Search, Filter, Download, FileText, Send, ExternalLink } from "lucide-react";

export default function QuotationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch quotations
  const { data: quotations, isLoading } = useQuery({
    queryKey: ["/api/quotations"],
  });

  // Type for quotation (simplified)
  type QuotationItem = {
    id: number;
    quotationNumber: string;
    company: string;
    companyName?: string; // For handling both formats
    total: string;
    status: string;
    validUntil: string;
    createdAt: string;
  };

  // Extract quotations handling both array and paginated response formats using useMemo
  const safeQuotations = React.useMemo(() => {
    if (!quotations) return [];
    
    // Check if it's a paginated response
    if (quotations && typeof quotations === 'object' && 'data' in quotations && Array.isArray(quotations.data)) {
      return quotations.data;
    }
    
    // Check if it's a direct array
    if (Array.isArray(quotations)) {
      return quotations;
    }
    
    // If neither, return empty array
    return [];
  }, [quotations]);
  
  // Filter quotations based on search query
  const filteredQuotations = React.useMemo(() => {
    return safeQuotations.filter((quotation: QuotationItem) => {
      const quotationNumber = quotation.quotationNumber?.toLowerCase() || '';
      const companyName = (quotation.company || quotation.companyName || '').toLowerCase();
      
      return quotationNumber.includes(searchQuery.toLowerCase()) || 
             companyName.includes(searchQuery.toLowerCase());
    });
  }, [safeQuotations, searchQuery]);

  // Function to delete a quotation
  const deleteQuotation = async (quotationId: number) => {
    try {
      toast({
        title: "Deleting quotation...",
        description: "Please wait while we delete the quotation",
      });
      
      const response = await apiRequest("DELETE", `/api/quotations/${quotationId}`);
      if (!response.ok) {
        throw new Error(`Failed to delete quotation: ${response.status}`);
      }
      
      toast({
        title: "Success",
        description: "Quotation deleted successfully",
      });
      
      // Refresh the quotations list
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      
    } catch (error) {
      console.error("Error deleting quotation:", error);
      toast({
        title: "Error",
        description: `Failed to delete quotation: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };
  
  // Function to directly duplicate a quotation and its items
  const duplicateQuotation = async (quotationId: number) => {
    try {
      // 1. Fetch source quotation
      const sourceQuotationRes = await apiRequest("GET", `/api/quotations/${quotationId}`);
      if (!sourceQuotationRes.ok) {
        throw new Error(`Failed to fetch source quotation: ${sourceQuotationRes.status}`);
      }
      const sourceQuotation = await sourceQuotationRes.json();
      
      // Generate a new quotation number
      const newQuotationNumber = `QT-${new Date().getFullYear()}-${
        String(new Date().getMonth() + 1).padStart(2, '0')
      }${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      
      // 2. Create a new quotation based on the source
      const newQuotationData = {
        quotationNumber: newQuotationNumber,
        opportunityId: sourceQuotation.opportunityId || undefined,
        companyId: sourceQuotation.companyId || undefined,
        contactId: sourceQuotation.contactId || undefined,
        subtotal: sourceQuotation.subtotal,
        tax: sourceQuotation.tax || 0,
        discount: sourceQuotation.discount || 0,
        total: sourceQuotation.total,
        status: "draft", // Always create as draft
        validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        notes: sourceQuotation.notes || "",
      };
      
      toast({
        title: "Duplicating quotation...",
        description: "Please wait while we create a duplicate quotation",
      });
      
      // Create the new quotation
      const newQuotationRes = await apiRequest("POST", "/api/quotations", newQuotationData);
      if (!newQuotationRes.ok) {
        throw new Error(`Failed to create new quotation: ${newQuotationRes.status}`);
      }
      const newQuotation = await newQuotationRes.json();
      
      // 3. Fetch the items of the source quotation
      const sourceItemsRes = await apiRequest("GET", `/api/quotations/${quotationId}/items`);
      if (!sourceItemsRes.ok) {
        throw new Error(`Failed to fetch source quotation items: ${sourceItemsRes.status}`);
      }
      const sourceItems = await sourceItemsRes.json();
      
      // 4. Create items for the new quotation
      if (sourceItems && sourceItems.length > 0) {
        for (const item of sourceItems) {
          const itemData = {
            quotationId: newQuotation.id,
            productId: item.productId,
            description: item.description || "",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            tax: item.tax || "0",
            subtotal: item.subtotal
          };
          
          await apiRequest("POST", `/api/quotations/${newQuotation.id}/items`, itemData);
        }
        
        toast({
          title: "Quotation duplicated",
          description: `Successfully duplicated quotation with ${sourceItems.length} items`,
        });
      } else {
        toast({
          title: "Quotation duplicated",
          description: "Quotation was duplicated, but no items were found to copy",
        });
      }
      
      // 5. Refresh the quotations list
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      
    } catch (error) {
      console.error("Error duplicating quotation:", error);
      toast({
        title: "Error",
        description: `Failed to duplicate quotation: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "sent":
        return <Badge variant="default">Sent</Badge>;
      case "viewed":
        return <Badge className="bg-indigo-100 text-indigo-800">Viewed</Badge>;
      case "accepted":
        return <Badge variant="outline" className="text-green-600 border-green-600">Accepted</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-red-600 border-red-600">Rejected</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
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
            <h1 className="text-2xl font-semibold text-slate-800">Quotations</h1>
            <p className="mt-1 text-sm text-slate-500">Create and manage quotations for your customers</p>
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
            <Button className="inline-flex items-center" onClick={() => navigate("/quotations/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Quotation
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <Input
              type="text"
              placeholder="Search quotations by number or company..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Quotations Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-500">Loading quotations...</p>
            </div>
          ) : filteredQuotations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No quotations found</h3>
              <p className="text-slate-500 mb-4">
                {searchQuery 
                  ? "No quotations match your search criteria. Try adjusting your search."
                  : "You haven't created any quotations yet. Create your first one now."
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate("/quotations/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Quotation
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quotation #</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.map((quotation: QuotationItem) => (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium">{quotation.quotationNumber}</TableCell>
                    <TableCell>{quotation.company_name || quotation.companyName || quotation.company || "—"}</TableCell>
                    <TableCell>
                      {quotation.total && quotation.total !== '0' && quotation.total !== '0.00'
                        ? `₹${parseFloat(quotation.total).toLocaleString('en-IN', { 
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2 
                          })}`
                        : '₹0.00'
                      }
                    </TableCell>
                    <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                    <TableCell>
                      {quotation.validUntil 
                        ? new Date(quotation.validUntil).toLocaleDateString() 
                        : "—"
                      }
                    </TableCell>
                    <TableCell>{new Date(quotation.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {quotation.status === "draft" && (
                          <Button variant="ghost" size="icon" title="Send Quotation">
                            <Send className="h-4 w-4 text-slate-500" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="View PDF"
                          onClick={() => window.open(`/api/quotations/${quotation.id}/pdf`, '_blank')}
                        >
                          <FileText className="h-4 w-4 text-slate-500" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate(`/quotations/${quotation.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/quotations/${quotation.id}/edit`)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate(`/orders/new?quotationId=${quotation.id}`)}>
                              Convert to Order
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicateQuotation(quotation.id)}>
                              Duplicate (Direct)
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this quotation? This action cannot be undone.")) {
                                  deleteQuotation(quotation.id);
                                }
                              }}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
