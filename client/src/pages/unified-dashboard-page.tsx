import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { LeadsTable } from "@/components/leads/leads-table";
import { OpportunitiesTable } from "@/components/opportunities/opportunities-table";
import { TasksTable } from "@/components/tasks/tasks-table";
import { SalesOrdersTable } from "@/components/sales/sales-orders-table";
import { QuotationsTable } from "@/components/quotations/quotations-table";
import { 
  BarChart3, 
  CreditCard, 
  FileText, 
  ListChecks, 
  Loader2, 
  PlusCircle, 
  Search, 
  UserRound 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useLocation } from "wouter";

export default function UnifiedDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("leads");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Fetch users for assignee filter
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users");
      if (res.ok) {
        return await res.json();
      }
      throw new Error("Failed to fetch users");
    },
  });
  
  // Leads data and fetching
  const { 
    data: leads = [], 
    isLoading: isLoadingLeads,
    refetch: refetchLeads 
  } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/leads");
      if (res.ok) {
        return await res.json();
      }
      throw new Error("Failed to fetch leads");
    },
  });
  
  // Opportunities data and fetching
  const { 
    data: opportunities = [], 
    isLoading: isLoadingOpportunities,
    refetch: refetchOpportunities 
  } = useQuery({
    queryKey: ["/api/opportunities"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/opportunities");
      if (res.ok) {
        return await res.json();
      }
      throw new Error("Failed to fetch opportunities");
    },
    enabled: activeTab === "opportunities",
  });
  
  // Tasks data and fetching
  const { 
    data: tasks = [], 
    isLoading: isLoadingTasks,
    refetch: refetchTasks 
  } = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tasks");
      if (res.ok) {
        return await res.json();
      }
      throw new Error("Failed to fetch tasks");
    },
    enabled: activeTab === "tasks",
  });
  
  // Quotations data and fetching
  const { 
    data: quotations = [], 
    isLoading: isLoadingQuotations,
    refetch: refetchQuotations 
  } = useQuery({
    queryKey: ["/api/quotations"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/quotations");
      if (res.ok) {
        return await res.json();
      }
      throw new Error("Failed to fetch quotations");
    },
    enabled: activeTab === "quotations",
  });
  
  // Sales Orders data and fetching
  const { 
    data: salesOrders = [], 
    isLoading: isLoadingSalesOrders,
    refetch: refetchSalesOrders 
  } = useQuery({
    queryKey: ["/api/sales-orders"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/sales-orders");
      if (res.ok) {
        return await res.json();
      }
      throw new Error("Failed to fetch sales orders");
    },
    enabled: activeTab === "salesOrders",
  });

  // Filter data based on search query, status, and assignee
  const filterData = (data: any[]) => {
    return data.filter((item) => {
      // Filter by search query
      const searchMatch = searchQuery === "" || 
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by status if not "all"
      const statusMatch = statusFilter === "all" || 
        (item.status && item.status.toLowerCase() === statusFilter.toLowerCase());
      
      // Filter by assignee if not "all"
      const assigneeMatch = assigneeFilter === "all" || 
        (item.assignedTo && String(item.assignedTo) === assigneeFilter);
      
      return searchMatch && statusMatch && assigneeMatch;
    });
  };

  // Get appropriate filtered data based on active tab
  const getFilteredData = () => {
    switch (activeTab) {
      case "leads":
        return filterData(leads);
      case "opportunities":
        return filterData(opportunities);
      case "tasks":
        return filterData(tasks);
      case "quotations":
        return filterData(quotations);
      case "salesOrders":
        return filterData(salesOrders);
      default:
        return [];
    }
  };

  // Get loading state based on active tab
  const isLoading = () => {
    switch (activeTab) {
      case "leads":
        return isLoadingLeads;
      case "opportunities":
        return isLoadingOpportunities;
      case "tasks":
        return isLoadingTasks;
      case "quotations":
        return isLoadingQuotations;
      case "salesOrders":
        return isLoadingSalesOrders;
      default:
        return false;
    }
  };

  // Get status options based on active tab
  const getStatusOptions = () => {
    switch (activeTab) {
      case "leads":
        return [
          { value: "New", label: "New" },
          { value: "Contacted", label: "Contacted" },
          { value: "Qualified", label: "Qualified" },
          { value: "Converted", label: "Converted" },
          { value: "Disqualified", label: "Disqualified" },
        ];
      case "opportunities":
        return [
          { value: "Qualification", label: "Qualification" },
          { value: "Needs Analysis", label: "Needs Analysis" },
          { value: "Proposal", label: "Proposal" },
          { value: "Negotiation", label: "Negotiation" },
          { value: "Closed Won", label: "Closed Won" },
          { value: "Closed Lost", label: "Closed Lost" },
        ];
      case "tasks":
        return [
          { value: "Not Started", label: "Not Started" },
          { value: "In Progress", label: "In Progress" },
          { value: "Completed", label: "Completed" },
          { value: "Deferred", label: "Deferred" },
        ];
      case "quotations":
        return [
          { value: "Draft", label: "Draft" },
          { value: "Sent", label: "Sent" },
          { value: "Accepted", label: "Accepted" },
          { value: "Rejected", label: "Rejected" },
          { value: "Expired", label: "Expired" },
        ];
      case "salesOrders":
        return [
          { value: "New", label: "New" },
          { value: "Processing", label: "Processing" },
          { value: "Delivered", label: "Delivered" },
          { value: "Completed", label: "Completed" },
          { value: "Cancelled", label: "Cancelled" },
        ];
      default:
        return [];
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setStatusFilter("all");
    setSearchQuery("");
    
    // Navigate to the corresponding full page if requested
    switch (value) {
      case "leads":
        // refetchLeads();
        break;
      case "opportunities":
        // refetchOpportunities();
        break;
      case "tasks":
        // refetchTasks();
        break;
      case "quotations":
        // refetchQuotations();
        break;
      case "salesOrders":
        // refetchSalesOrders();
        break;
    }
  };
  
  // Handle create button click
  const handleCreateClick = () => {
    switch (activeTab) {
      case "leads":
        navigate("/leads/new");
        break;
      case "opportunities":
        navigate("/opportunities/new");
        break;
      case "tasks":
        navigate("/tasks/new");
        break;
      case "quotations":
        navigate("/quotations/new");
        break;
      case "salesOrders":
        navigate("/sales-orders/new");
        break;
    }
  };

  // Generate title based on active tab
  const getTitle = () => {
    switch (activeTab) {
      case "leads":
        return "Manage Leads";
      case "opportunities":
        return "Manage Opportunities";
      case "tasks":
        return "Manage Tasks";
      case "quotations":
        return "Manage Quotations";
      case "salesOrders":
        return "Manage Sales Orders";
      default:
        return "Unified Dashboard";
    }
  };

  // Generate icon based on active tab
  const getIcon = () => {
    switch (activeTab) {
      case "leads":
        return <UserRound className="h-5 w-5 mr-2" />;
      case "opportunities":
        return <BarChart3 className="h-5 w-5 mr-2" />;
      case "tasks":
        return <ListChecks className="h-5 w-5 mr-2" />;
      case "quotations":
        return <FileText className="h-5 w-5 mr-2" />;
      case "salesOrders":
        return <CreditCard className="h-5 w-5 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-8">
          <div className="flex items-center justify-between space-y-2">
            <div className="flex items-center">
              {getIcon()}
              <h2 className="text-3xl font-bold tracking-tight">{getTitle()}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleCreateClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {activeTab === "leads" && "Add Lead"}
                {activeTab === "opportunities" && "Add Opportunity"}
                {activeTab === "tasks" && "Add Task"}
                {activeTab === "quotations" && "Add Quotation"}
                {activeTab === "salesOrders" && "Add Sales Order"}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="leads" value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            <TabsList className="grid grid-cols-5 w-full md:w-auto">
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="quotations">Quotations</TabsTrigger>
              <TabsTrigger value="salesOrders">Sales Orders</TabsTrigger>
            </TabsList>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Filters</CardTitle>
                <CardDescription>
                  Filter {activeTab} by search terms, status, or assignee
                </CardDescription>
                <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mt-4">
                  <div className="md:w-1/3">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={`Search ${activeTab}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8"
                      />
                    </div>
                  </div>
                  <div className="md:w-1/3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {getStatusOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:w-1/3">
                    <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assignees</SelectItem>
                        {users.map((user: any) => (
                          <SelectItem key={user.id} value={String(user.id)}>
                            {user.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {isLoading() ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div>
                    <TabsContent value="leads" className="m-0">
                      <LeadsTable 
                        leads={getFilteredData()} 
                        onUpdate={() => refetchLeads()}
                      />
                    </TabsContent>
                    
                    <TabsContent value="opportunities" className="m-0">
                      <OpportunitiesTable 
                        opportunities={getFilteredData()} 
                        onUpdate={() => refetchOpportunities()}
                      />
                    </TabsContent>
                    
                    <TabsContent value="tasks" className="m-0">
                      <TasksTable 
                        tasks={getFilteredData()} 
                        onUpdate={() => refetchTasks()}
                      />
                    </TabsContent>
                    
                    <TabsContent value="quotations" className="m-0">
                      <QuotationsTable 
                        quotations={getFilteredData()} 
                        onUpdate={() => refetchQuotations()}
                      />
                    </TabsContent>
                    
                    <TabsContent value="salesOrders" className="m-0">
                      <SalesOrdersTable 
                        salesOrders={getFilteredData()} 
                        onUpdate={() => refetchSalesOrders()}
                      />
                    </TabsContent>
                  </div>
                )}
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}