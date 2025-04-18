import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

  // Fetch quotations
  const { data: quotations, isLoading } = useQuery({
    queryKey: ["/api/quotations"],
  });

  // Default quotations for initial rendering
  const defaultQuotations = [
    { id: 1, quotationNumber: "QT-2023-001", company: "Acme Corp", total: "$12,500.00", status: "draft", validUntil: "2023-08-15", createdAt: "2023-07-15" },
    { id: 2, quotationNumber: "QT-2023-002", company: "TechGiant Inc", total: "$45,000.00", status: "sent", validUntil: "2023-08-30", createdAt: "2023-07-14" },
    { id: 3, quotationNumber: "QT-2023-003", company: "SecureData LLC", total: "$8,750.00", status: "viewed", validUntil: "2023-07-31", createdAt: "2023-07-10" },
    { id: 4, quotationNumber: "QT-2023-004", company: "DigiFuture Co", total: "$18,300.00", status: "accepted", validUntil: "2023-09-15", createdAt: "2023-07-08" },
    { id: 5, quotationNumber: "QT-2023-005", company: "GlobalTech Inc", total: "$27,500.00", status: "expired", validUntil: "2023-07-10", createdAt: "2023-06-25" },
    { id: 6, quotationNumber: "QT-2023-006", company: "MobiSoft", total: "$35,200.00", status: "rejected", validUntil: "2023-07-05", createdAt: "2023-06-20" },
  ];

  // Filter quotations based on search query
  const filteredQuotations = quotations
    ? quotations.filter(
        (quotation: any) =>
          quotation.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (quotation.company && quotation.company.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : defaultQuotations.filter(
        (quotation) =>
          quotation.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (quotation.company && quotation.company.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "sent":
        return <Badge variant="primary">Sent</Badge>;
      case "viewed":
        return <Badge variant="indigo-100 text-indigo-800">Viewed</Badge>;
      case "accepted":
        return <Badge variant="won">Accepted</Badge>;
      case "rejected":
        return <Badge variant="lost">Rejected</Badge>;
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
            <Button className="inline-flex items-center">
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
              {filteredQuotations.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">{quotation.quotationNumber}</TableCell>
                  <TableCell>{quotation.company}</TableCell>
                  <TableCell>{quotation.total}</TableCell>
                  <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                  <TableCell>{new Date(quotation.validUntil).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(quotation.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {quotation.status === "draft" && (
                        <Button variant="ghost" size="icon" title="Send Quotation">
                          <Send className="h-4 w-4 text-slate-500" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" title="View PDF">
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
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Convert to Order</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
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
    </DashboardLayout>
  );
}
