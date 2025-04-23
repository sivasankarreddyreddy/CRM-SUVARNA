import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { LeadForm } from "@/components/leads/lead-form";
import { LeadAssignmentModal } from "@/components/leads/lead-assignment-modal";
import { BulkLeadAssignmentModal } from "@/components/leads/bulk-lead-assignment-modal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, MoreVertical, Search, Filter, Download, UserPlus } from "lucide-react";

export default function LeadsPage() {
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editLead, setEditLead] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<number | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [leadToAssign, setLeadToAssign] = useState<any>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Check if user can assign leads (admin or sales_manager)
  const canAssignLeads = user?.role === 'admin' || user?.role === 'sales_manager';
  
  // Get users for assignment dropdown
  const { users, isLoading: isLoadingUsers } = useUsers();

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

  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", `/api/leads/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Lead updated successfully",
      });
      setLeadFormOpen(false);
      setIsEditMode(false);
      setEditLead(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update lead: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Delete lead mutation
  const deleteLeadMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setLeadToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete lead: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Handler functions for actions
  const handleEdit = (lead: any) => {
    console.log("Editing lead:", lead);
    setEditLead({...lead}); // Clone the lead object to avoid reference issues
    setIsEditMode(true);
    setLeadFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setLeadToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (leadToDelete) {
      deleteLeadMutation.mutate(leadToDelete);
    }
  };
  
  // Assignment handlers
  const handleAssignLead = (lead: any) => {
    setLeadToAssign(lead);
    setIsAssignModalOpen(true);
  };
  
  const handleBulkAssign = () => {
    if (selectedLeads.length === 0) {
      toast({
        title: "No leads selected",
        description: "Please select at least one lead to assign",
        variant: "destructive",
      });
      return;
    }
    
    setIsBulkAssignModalOpen(true);
  };
  
  const handleSelectLead = (leadId: number, checked: boolean) => {
    if (checked) {
      setSelectedLeads((prev) => [...prev, leadId]);
    } else {
      setSelectedLeads((prev) => prev.filter((id) => id !== leadId));
    }
  };
  
  const handleSelectAllLeads = (checked: boolean) => {
    if (checked) {
      const allLeadIds = displayLeads.map((lead) => lead.id);
      setSelectedLeads(allLeadIds);
    } else {
      setSelectedLeads([]);
    }
  };

  const handleConvertToOpportunity = (lead: any) => {
    navigate(`/opportunities/new?leadId=${lead.id}`);
    toast({
      title: "Converting lead to opportunity",
      description: "Please fill in the opportunity details",
    });
  };

  const handleAddActivity = (lead: any) => {
    console.log("Adding activity for lead:", lead);
    // Navigate to the standalone activity creation page
    navigate(`/activity-create/${lead.id}`);
    toast({
      title: "Adding activity",
      description: "Please fill in the activity details",
    });
  };

  const handleAddTask = (lead: any) => {
    console.log("Adding task for lead:", lead);
    // Navigate to the standalone task creation page
    navigate(`/task-create/${lead.id}`);
    toast({
      title: "Adding task",
      description: "Please fill in the task details",
    });
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
  const filteredLeads = leads && Array.isArray(leads)
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
            {canAssignLeads && selectedLeads.length > 0 && (
              <Button
                onClick={handleBulkAssign}
                variant="secondary"
                className="inline-flex items-center"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Assign {selectedLeads.length} Lead{selectedLeads.length !== 1 ? 's' : ''}
              </Button>
            )}
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
                {canAssignLeads && (
                  <TableHead className="w-[40px]">
                    <Checkbox 
                      checked={selectedLeads.length > 0 && selectedLeads.length === displayLeads.length}
                      onCheckedChange={handleSelectAllLeads}
                      aria-label="Select all leads"
                    />
                  </TableHead>
                )}
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]">Assigned To</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayLeads.map((lead) => (
                <TableRow key={lead.id} className={selectedLeads.includes(lead.id) ? "bg-muted/40" : ""}>
                  {canAssignLeads && (
                    <TableCell>
                      <Checkbox 
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={(checked) => handleSelectLead(lead.id, !!checked)}
                        aria-label={`Select lead ${lead.name}`}
                      />
                    </TableCell>
                  )}
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
                    {lead.assignedTo ? (
                      <span className="font-medium">
                        {/* Display username or placeholder if user data not loaded */}
                        {users && users.find((u: any) => u.id === lead.assignedTo)?.fullName || `User #${lead.assignedTo}`}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}`)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(lead)}>
                          Edit
                        </DropdownMenuItem>
                        {canAssignLeads && (
                          <DropdownMenuItem onClick={() => handleAssignLead(lead)}>
                            Assign Lead
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleConvertToOpportunity(lead)}>
                          Convert to Opportunity
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddActivity(lead)}>
                          Add Activity
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddTask(lead)}>
                          Add Task
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(lead.id)}
                          className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Lead Modal (New or Edit) */}
      <LeadForm
        open={leadFormOpen}
        onOpenChange={(open) => {
          setLeadFormOpen(open);
          if (!open) {
            // Reset edit mode and data when form is closed
            setIsEditMode(false);
            setEditLead(null);
          }
        }}
        onSubmit={isEditMode ? 
          (data) => updateLeadMutation.mutate({ ...data, id: editLead?.id }) : 
          handleNewLead
        }
        isLoading={isEditMode ? updateLeadMutation.isPending : createLeadMutation.isPending}
        initialData={isEditMode ? editLead : undefined}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lead and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Individual Lead Assignment Modal */}
      <LeadAssignmentModal
        open={isAssignModalOpen && !!leadToAssign}
        onOpenChange={setIsAssignModalOpen}
        leadId={leadToAssign?.id || 0}
        leadName={leadToAssign?.name || ""}
        currentAssignee={leadToAssign?.assignedTo || null}
      />
      
      {/* Bulk Lead Assignment Modal */}
      <BulkLeadAssignmentModal
        open={isBulkAssignModalOpen}
        onOpenChange={setIsBulkAssignModalOpen}
        selectedLeadIds={selectedLeads}
      />
    </DashboardLayout>
  );
}
