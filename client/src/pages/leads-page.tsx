import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SimpleLeadForm } from "@/components/leads/simple-lead-form";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, MoreVertical, Search, Filter, Download, UserPlus, X, FileDown, Calendar } from "lucide-react";

export default function LeadsPage() {
  const [leadFormOpen, setLeadFormOpen] = useState(false);
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
  
  // Filter and pagination states
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [leadSearchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  
  // Check if user can assign leads (admin or sales_manager)
  const canAssignLeads = user?.role === 'admin' || user?.role === 'sales_manager';
  
  // Get users for assignment dropdown
  const { users, isLoading: isLoadingUsers } = useUsers();

  // Fetch leads with filters and pagination
  const { data: paginatedLeads, isLoading } = useQuery({
    queryKey: [
      "/api/leads", 
      currentPage, 
      itemsPerPage, 
      leadSearchQuery, 
      sortColumn, 
      sortDirection,
      fromDate,
      toDate,
      statusFilter,
      sourceFilter,
      assigneeFilter
    ],
    queryFn: async () => {
      // Construct query parameters for filtering and pagination
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: itemsPerPage.toString(),
      });
      
      // Add optional filters if they exist
      if (leadSearchQuery) params.append("search", leadSearchQuery);
      if (sortColumn) params.append("column", sortColumn);
      if (sortDirection) params.append("direction", sortDirection);
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);
      if (statusFilter) params.append("status", statusFilter);
      if (sourceFilter) params.append("source", sourceFilter);
      if (assigneeFilter) params.append("assignedTo", assigneeFilter);
      
      console.log("Fetching leads with params:", Object.fromEntries(params.entries()));
      
      // Fetch the data with the constructed parameters
      const response = await fetch(`/api/leads?${params.toString()}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching leads:", errorText);
        throw new Error(`Failed to fetch leads: ${errorText}`);
      }
      
      return await response.json();
    }
  });

  // Create lead mutation
  const createLeadMutation = useMutation({
    mutationFn: async (data: any) => {
      // Make sure required fields are set
      return await apiRequest("POST", "/api/leads", {
        ...data,
        status: data.status || "new",
        createdBy: user?.id,
        // Include user's team ID if user is a manager or executive
        teamId: user?.teamId || null
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
      console.error("Create lead error:", error);
      toast({
        title: "Error",
        description: "Failed to create lead: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleNewLead = (data: any) => {
    console.log("Creating lead with data:", data);
    const leadData = {
      ...data,
      createdBy: user?.id
    };
    console.log("Final lead data to submit:", leadData);
    createLeadMutation.mutate(leadData);
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
  
  // Handle predefined date filter changes
  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    
    // Set fromDate and toDate based on the selected filter value
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of day
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0); // Start of yesterday
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
    lastWeekEnd.setHours(23, 59, 59, 999);
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    lastMonthEnd.setHours(23, 59, 59, 999);
    
    const thisYearStart = new Date(today.getFullYear(), 0, 1);
    
    const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
    lastYearEnd.setHours(23, 59, 59, 999);
    
    let newFromDate: string | null = null;
    let newToDate: string | null = null;
    
    switch (value) {
      case "today":
        newFromDate = new Date(today.setHours(0, 0, 0, 0)).toISOString().split('T')[0];
        newToDate = today.toISOString().split('T')[0];
        break;
      case "yesterday":
        newFromDate = yesterday.toISOString().split('T')[0];
        newToDate = yesterday.toISOString().split('T')[0];
        break;
      case "thisWeek":
        newFromDate = thisWeekStart.toISOString().split('T')[0];
        newToDate = today.toISOString().split('T')[0];
        break;
      case "lastWeek":
        newFromDate = lastWeekStart.toISOString().split('T')[0];
        newToDate = lastWeekEnd.toISOString().split('T')[0];
        break;
      case "thisMonth":
        newFromDate = thisMonthStart.toISOString().split('T')[0];
        newToDate = today.toISOString().split('T')[0];
        break;
      case "lastMonth":
        newFromDate = lastMonthStart.toISOString().split('T')[0];
        newToDate = lastMonthEnd.toISOString().split('T')[0];
        break;
      case "thisYear":
        newFromDate = thisYearStart.toISOString().split('T')[0];
        newToDate = today.toISOString().split('T')[0];
        break;
      case "lastYear":
        newFromDate = lastYearStart.toISOString().split('T')[0];
        newToDate = lastYearEnd.toISOString().split('T')[0];
        break;
      case "custom":
        // Don't change dates, let the user set them with the date inputs
        break;
      case "all":
      default:
        // Clear date filters
        newFromDate = null;
        newToDate = null;
        break;
    }
    
    setFromDate(newFromDate);
    setToDate(newToDate);
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

  // If we have paginated leads from the server, use that data directly
  const leads = paginatedLeads ? paginatedLeads.data : [];
  const totalPages = paginatedLeads ? paginatedLeads.totalPages : 0;
  const totalCount = paginatedLeads ? paginatedLeads.totalCount : 0;
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Generate page numbers for pagination with a limited display range
  // Type definition for page numbers to include ellipsis indicators
  type PageDisplay = number | 'ellipsis-start' | 'ellipsis-end';
  
  const generatePageRange = (): PageDisplay[] => {
    const maxPagesToShow = 5; // Show a maximum of 5 page numbers at a time
    const pageNumbers: PageDisplay[] = [];
    
    if (totalPages <= maxPagesToShow) {
      // If we have fewer pages than our maximum, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate start and end of the current window
      let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 3);
      
      // Adjust the window if we're at the edges
      if (startPage > 2) {
        pageNumbers.push('ellipsis-start');
      }
      
      // Add the window of pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if there are more pages after the window
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis-end');
      }
      
      // Always include last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  const pageNumbers = generatePageRange();
  
  // Handle export functionality
  const handleExportCSV = () => {
    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      toast({
        title: "No leads to export",
        description: "There are no leads available to export.",
        variant: "destructive",
      });
      return;
    }
    
    // Define headers for CSV
    const headers = [
      "ID", 
      "Name", 
      "Email", 
      "Phone", 
      "Company", 
      "Source", 
      "Status", 
      "Created Date", 
      "Assigned To"
    ];
    
    // Transform the leads data into CSV format
    let csvContent = headers.join(",") + "\n";
    
    // Use the leads array for export (filters are applied on the server side)
    const leadsToExport = leads;
    
    leadsToExport.forEach(lead => {
      const assignedToUser = users?.find(u => u.id === lead.assignedTo);
      const row = [
        lead.id,
        `"${lead.name || ''}"`,
        `"${lead.email || ''}"`,
        `"${lead.phone || ''}"`,
        `"${lead.companyName || ''}"`,
        `"${lead.source || ''}"`,
        `"${lead.status || ''}"`,
        `"${new Date(lead.createdAt).toLocaleDateString()}"`,
        `"${assignedToUser ? assignedToUser.fullName : 'Unassigned'}"`
      ];
      csvContent += row.join(",") + "\n";
    });
    
    // Create a blob and download the CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: `${leadsToExport.length} leads exported to CSV.`,
    });
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, sourceFilter, dateFilter, assigneeFilter, leadSearchQuery]);
  
  // Use only data from the server
  const displayLeads = leads || [];

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
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="inline-flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  {(statusFilter || sourceFilter || dateFilter || assigneeFilter) && (
                    <Badge variant="secondary" className="ml-2 rounded-sm px-1">
                      {[
                        statusFilter && '1',
                        sourceFilter && '1',
                        dateFilter && '1',
                        assigneeFilter && '1'
                      ].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Filter Leads</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="disqualified">Disqualified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Source</label>
                    <Select
                      value={sourceFilter}
                      onValueChange={setSourceFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All sources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All sources</SelectItem>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                        <SelectItem value="Conference">Conference</SelectItem>
                        <SelectItem value="Cold Call">Cold Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Created</label>
                    <Select
                      value={dateFilter}
                      onValueChange={handleDateFilterChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any time" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        <SelectItem value="all">Any time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="thisWeek">This week</SelectItem>
                        <SelectItem value="lastWeek">Last week</SelectItem>
                        <SelectItem value="thisMonth">This month</SelectItem>
                        <SelectItem value="lastMonth">Last month</SelectItem>
                        <SelectItem value="thisYear">This year</SelectItem>
                        <SelectItem value="lastYear">Last year</SelectItem>
                        <SelectItem value="custom">Custom date range</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {dateFilter === "custom" && (
                      <div className="pt-2 space-y-2">
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Start Date</label>
                          <div className="relative">
                            <Input 
                              type="date" 
                              className="w-full" 
                              value={fromDate || ''}
                              onChange={(e) => {
                                const newFromDate = e.target.value || null;
                                setFromDate(newFromDate);
                                
                                // Update the URL with the start date
                                const urlParams = new URLSearchParams(window.location.search);
                                if (newFromDate) {
                                  urlParams.set("fromDate", newFromDate);
                                } else {
                                  urlParams.delete("fromDate");
                                }
                                
                                // Update page URL without reload
                                window.history.replaceState(
                                  {},
                                  '',
                                  `${window.location.pathname}?${urlParams}`
                                );
                                
                                // Force re-filtering
                                setCurrentPage(1);
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-xs font-medium">End Date</label>
                          <div className="relative">
                            <Input 
                              type="date" 
                              className="w-full" 
                              value={toDate || ''}
                              onChange={(e) => {
                                const newToDate = e.target.value || null;
                                setToDate(newToDate);
                                
                                // Update the URL with the end date
                                const urlParams = new URLSearchParams(window.location.search);
                                if (newToDate) {
                                  urlParams.set("toDate", newToDate);
                                } else {
                                  urlParams.delete("toDate");
                                }
                                
                                // Update page URL without reload
                                window.history.replaceState(
                                  {},
                                  '',
                                  `${window.location.pathname}?${urlParams}`
                                );
                                
                                // Force re-filtering
                                setCurrentPage(1);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assigned To</label>
                    <Select
                      value={assigneeFilter}
                      onValueChange={setAssigneeFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Anyone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Anyone</SelectItem>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {users && users.map((user: any) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.fullName || user.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setStatusFilter("all");
                        setSourceFilter("all");
                        setDateFilter("all");
                        setAssigneeFilter("all");
                        setFromDate(null);
                        setToDate(null);
                      }}
                      className="text-sm text-muted-foreground"
                    >
                      Reset filters
                    </Button>
                    <Button onClick={() => setFilterOpen(false)}>
                      Apply filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="outline" 
              className="inline-flex items-center"
              onClick={handleExportCSV}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export CSV
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
              onClick={() => {
                // Reset form state for new lead
                setIsEditMode(false);
                setEditLead(null);
                setLeadFormOpen(true);
              }}
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
              value={leadSearchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
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
                <TableHead>Modified By</TableHead>
                <TableHead>Modified Date</TableHead>
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
                    {lead.modifiedBy ? (
                      <span className="text-sm">
                        {users && users.find((u: any) => u.id === lead.modifiedBy)?.fullName || `User #${lead.modifiedBy}`}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.modifiedAt ? (
                      <span className="text-sm">
                        {new Date(lead.modifiedAt).toLocaleDateString()} {new Date(lead.modifiedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
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
        
        {/* Pagination */}
        {leads && Array.isArray(leads) && leads.length > itemsPerPage && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1); // Reset to first page when changing items per page
                  }}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder={`${itemsPerPage} per page`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per page</SelectItem>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="25">25 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                    <SelectItem value="100">100 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {pageNumbers.map((number, index) => (
                    typeof number === 'string' ? (
                      <PaginationItem key={`${number}-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={number}>
                        <PaginationLink
                          onClick={() => paginate(number)}
                          isActive={currentPage === number}
                        >
                          {number}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
            
            <div className="mt-2 text-center text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} leads (Page {currentPage} of {totalPages})
            </div>
          </div>
        )}
      </div>

      {/* Lead Modal (New or Edit) */}
      <SimpleLeadForm
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
