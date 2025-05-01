import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { Plus, MoreVertical, Search, Filter, Download } from "lucide-react";

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [opportunityFormOpen, setOpportunityFormOpen] = useState(false);
  const [editOpportunity, setEditOpportunity] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState<number | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch opportunities
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ["/api/opportunities"],
  });

  // Default opportunities for initial rendering
  const defaultOpportunities = [
    { id: 1, name: "Cloud Migration Service", company: "Acme Corp", stage: "qualification", value: "$12,500", probability: 30, expectedCloseDate: "2023-08-15" },
    { id: 2, name: "ERP Implementation", company: "TechGiant Inc", stage: "negotiation", value: "$45,000", probability: 70, expectedCloseDate: "2023-08-30" },
    { id: 3, name: "Security Assessment", company: "SecureData LLC", stage: "closing", value: "$8,750", probability: 90, expectedCloseDate: "2023-07-31" },
    { id: 4, name: "Digital Marketing Campaign", company: "DigiFuture Co", stage: "proposal", value: "$18,300", probability: 50, expectedCloseDate: "2023-09-15" },
    { id: 5, name: "Hardware Upgrade", company: "GlobalTech Inc", stage: "won", value: "$27,500", probability: 100, expectedCloseDate: "2023-07-10" },
    { id: 6, name: "Mobile App Development", company: "MobiSoft", stage: "lost", value: "$35,200", probability: 0, expectedCloseDate: "2023-07-05" },
  ];

  // Create opportunity mutation
  const createOpportunityMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/opportunities", {
        ...data,
        createdBy: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      toast({
        title: "Success",
        description: "Opportunity created successfully",
      });
      setOpportunityFormOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create opportunity: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Update opportunity mutation
  const updateOpportunityMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", `/api/opportunities/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      toast({
        title: "Success",
        description: "Opportunity updated successfully",
      });
      setOpportunityFormOpen(false);
      setIsEditMode(false);
      setEditOpportunity(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update opportunity: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Delete opportunity mutation
  const deleteOpportunityMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/opportunities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      toast({
        title: "Success",
        description: "Opportunity deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setOpportunityToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete opportunity: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Handler functions
  const handleNewOpportunity = (data: any) => {
    createOpportunityMutation.mutate(data);
  };

  const handleEdit = (opportunity: any) => {
    setEditOpportunity(opportunity);
    setIsEditMode(true);
    setOpportunityFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setOpportunityToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (opportunityToDelete) {
      deleteOpportunityMutation.mutate(opportunityToDelete);
    }
  };

  const handleCreateQuotation = (opportunity: any) => {
    navigate(`/quotations/new?opportunityId=${opportunity.id}`);
    toast({
      title: "Creating quotation",
      description: "Please fill in the quotation details",
    });
  };

  const handleConvertToSale = (opportunity: any) => {
    navigate(`/orders/new?opportunityId=${opportunity.id}`);
    toast({
      title: "Converting to sale",
      description: "Please fill in the sales order details",
    });
  };

  const handleLogActivity = (opportunity: any) => {
    navigate(`/activities/new?opportunityId=${opportunity.id}&relatedTo=opportunity`);
    toast({
      title: "Logging activity",
      description: "Please fill in the activity details",
    });
  };

  // Filter opportunities based on search query
  const filteredOpportunities = opportunities && Array.isArray(opportunities)
    ? opportunities.filter(
        (opportunity: any) =>
          opportunity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (opportunity.company && opportunity.company.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : defaultOpportunities.filter(
        (opportunity) =>
          opportunity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (opportunity.company && opportunity.company.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Opportunities</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your sales pipeline and track deal progress</p>
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
              onClick={() => {
                setIsEditMode(false);
                setEditOpportunity(null);
                setOpportunityFormOpen(true);
              }}
              className="inline-flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Opportunity
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <Input
              type="text"
              placeholder="Search opportunities by name or company..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Opportunities Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Expected Close</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOpportunities.map((opportunity) => (
                <TableRow key={opportunity.id}>
                  <TableCell className="font-medium">{opportunity.name}</TableCell>
                  <TableCell>{opportunity.company}</TableCell>
                  <TableCell>
                    <Badge variant={opportunity.stage}>
                      {opportunity.stage.charAt(0).toUpperCase() + opportunity.stage.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{opportunity.value}</TableCell>
                  <TableCell>{opportunity.probability}%</TableCell>
                  <TableCell>{new Date(opportunity.expectedCloseDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/opportunities/${opportunity.id}`)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(opportunity)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleCreateQuotation(opportunity)}>
                          Create Quotation
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleConvertToSale(opportunity)}>
                          Convert to Sale
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleLogActivity(opportunity)}>
                          Log Activity
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(opportunity.id)}
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

      {/* Opportunity Form Modal */}
      {opportunityFormOpen && (
        <AlertDialog open={opportunityFormOpen} onOpenChange={setOpportunityFormOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle>{isEditMode ? 'Edit Opportunity' : 'Add New Opportunity'}</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">Opportunity Name *</label>
                <Input 
                  id="name"
                  defaultValue={editOpportunity?.name || ""}
                  placeholder="Opportunity name" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="company" className="text-sm font-medium">Company *</label>
                  <Input 
                    id="company"
                    defaultValue={editOpportunity?.company || ""}
                    placeholder="Company name" 
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="value" className="text-sm font-medium">Value *</label>
                  <Input 
                    id="value"
                    defaultValue={editOpportunity?.value || ""}
                    placeholder="e.g. $10,000" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="stage" className="text-sm font-medium">Stage *</label>
                  <select 
                    id="stage"
                    defaultValue={editOpportunity?.stage || "qualification"}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="qualification">Qualification</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closing">Closing</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="probability" className="text-sm font-medium">Probability (%) *</label>
                  <Input 
                    id="probability"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={editOpportunity?.probability || "50"}
                    placeholder="Probability %" 
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="expectedCloseDate" className="text-sm font-medium">Expected Close Date *</label>
                  <Input 
                    id="expectedCloseDate"
                    type="date"
                    defaultValue={editOpportunity?.expectedCloseDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <textarea 
                  id="description"
                  defaultValue={editOpportunity?.description || ""}
                  placeholder="Add more details about this opportunity" 
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button type="submit" onClick={() => {
                const formData = {
                  name: (document.getElementById('name') as HTMLInputElement).value,
                  company: (document.getElementById('company') as HTMLInputElement).value,
                  value: (document.getElementById('value') as HTMLInputElement).value,
                  stage: (document.getElementById('stage') as HTMLSelectElement).value,
                  probability: parseInt((document.getElementById('probability') as HTMLInputElement).value, 10),
                  expectedCloseDate: (document.getElementById('expectedCloseDate') as HTMLInputElement).value,
                  description: (document.getElementById('description') as HTMLTextAreaElement).value,
                };
                
                if (isEditMode && editOpportunity) {
                  updateOpportunityMutation.mutate({ ...formData, id: editOpportunity.id });
                } else {
                  createOpportunityMutation.mutate(formData);
                }
              }}>
                {isEditMode ? 'Update Opportunity' : 'Add Opportunity'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the opportunity and all associated data.
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
    </DashboardLayout>
  );
}
