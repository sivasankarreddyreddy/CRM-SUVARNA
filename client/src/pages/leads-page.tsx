import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { LeadForm } from "@/components/leads/lead-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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
import { Plus, MoreVertical, Search, Filter, Download } from "lucide-react";

export default function LeadsPage() {
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch leads
  const { data: leads, isLoading } = useQuery({
    queryKey: ["/api/leads"],
  });

  // Create lead mutation
  const createLeadMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/leads", {
        ...data,
        createdBy: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Lead created successfully",
      });
      setLeadFormOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create lead: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleNewLead = (data: any) => {
    createLeadMutation.mutate(data);
  };

  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return "default";
    
    switch (status.toLowerCase()) {
      case "new":
        return "qualification";
      case "contacted":
        return "proposal";
      case "qualified":
        return "negotiation";
      case "converted":
        return "won";
      case "disqualified":
        return "lost";
      default:
        return "default";
    }
  };

  // Filter leads based on search query
  const filteredLeads = leads
    ? leads.filter(
        (lead: any) =>
          lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (lead.companyName && lead.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  // Default leads for initial rendering
  const defaultLeads = [
    { id: 1, name: "John Smith", email: "john@acmecorp.com", phone: "555-123-4567", companyName: "Acme Corp", source: "Website", status: "New", createdAt: "2023-07-15T10:30:00" },
    { id: 2, name: "Sarah Johnson", email: "sarah@techgiant.com", phone: "555-987-6543", companyName: "TechGiant Inc", source: "Referral", status: "Contacted", createdAt: "2023-07-14T15:45:00" },
    { id: 3, name: "Michael Brown", email: "michael@securedata.com", phone: "555-456-7890", companyName: "SecureData LLC", source: "Email Campaign", status: "Qualified", createdAt: "2023-07-10T09:20:00" },
    { id: 4, name: "Emily Davis", email: "emily@digifuture.com", phone: "555-789-0123", companyName: "DigiFuture Co", source: "Social Media", status: "Converted", createdAt: "2023-07-05T14:10:00" },
    { id: 5, name: "David Wilson", email: "david@globaltech.com", phone: "555-234-5678", companyName: "GlobalTech Inc", source: "Website", status: "Disqualified", createdAt: "2023-07-02T11:05:00" },
  ];

  const displayLeads = leads ? filteredLeads : defaultLeads;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Leads</h1>
            <p className="mt-1 text-sm text-slate-500">Manage and track all your potential customers</p>
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
            <Button
              onClick={() => setLeadFormOpen(true)}
              className="inline-flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <Input
              type="text"
              placeholder="Search leads by name, company, or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.companyName || "-"}</TableCell>
                  <TableCell>{lead.email || "-"}</TableCell>
                  <TableCell>{lead.source || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => window.location.href = `/leads/${lead.id}`}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Convert to Opportunity</DropdownMenuItem>
                        <DropdownMenuItem>Add Activity</DropdownMenuItem>
                        <DropdownMenuItem>Add Task</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* New Lead Modal */}
      <LeadForm
        open={leadFormOpen}
        onOpenChange={setLeadFormOpen}
        onSubmit={handleNewLead}
        isLoading={createLeadMutation.isPending}
      />
    </DashboardLayout>
  );
}
