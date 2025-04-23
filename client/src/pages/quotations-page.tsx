import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Plus, MoreVertical, Search, Filter, Download, FileText, Send, ExternalLink } from "lucide-react";

export default function QuotationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  // Fetch quotations
  const { data: quotations, isLoading } = useQuery({
    queryKey: ["/api/quotations"],
  });

  // Type for quotation (simplified)
  type QuotationItem = {
    id: number;
    quotationNumber: string;
    company: string;
    total: string;
    status: string;
    validUntil: string;
    createdAt: string;
  };

  // Filter quotations based on search query
  const safeQuotations: QuotationItem[] = Array.isArray(quotations) ? quotations : [];
  const filteredQuotations = safeQuotations.filter((quotation: QuotationItem) =>
    quotation.quotationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (quotation.company && quotation.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
                    <TableCell>{quotation.company || "—"}</TableCell>
                    <TableCell>
                      {typeof quotation.total === 'string' 
                        ? `₹${parseFloat(quotation.total).toLocaleString('en-IN', { 
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2 
                          })}`
                        : quotation.total
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
                            <DropdownMenuItem onClick={() => navigate(`/quotations/new?duplicate=${quotation.id}`)}>
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this quotation?")) {
                                  // Delete logic would go here
                                  alert("Delete functionality will be implemented in a future update");
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
