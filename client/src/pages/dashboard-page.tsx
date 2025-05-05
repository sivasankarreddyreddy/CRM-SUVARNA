import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { RecentOpportunities } from "@/components/dashboard/recent-opportunities";
import { TasksList } from "@/components/dashboard/tasks-list";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { LeadSources } from "@/components/dashboard/lead-sources";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Megaphone, TrendingUp, IndianRupee, BarChart2 } from "lucide-react";
import { LeadForm } from "@/components/leads/lead-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function DashboardPage() {
  const { user } = useAuth();
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Helper function to get period parameters for API calls
  const getPeriodParams = () => {
    return { period: selectedPeriod };
  };

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/dashboard/stats", selectedPeriod],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/dashboard/stats?period=${selectedPeriod}`);
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return await res.json();
    },
  });

  // Fetch pipeline data
  const { data: pipelineData, isLoading: isLoadingPipeline } = useQuery({
    queryKey: ["/api/dashboard/pipeline", selectedPeriod],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/dashboard/pipeline?period=${selectedPeriod}`);
      if (!res.ok) throw new Error("Failed to fetch pipeline data");
      return await res.json();
    },
  });

  // Fetch recent opportunities
  const { data: recentOpportunities, isLoading: isLoadingOpportunities } = useQuery({
    queryKey: ["/api/opportunities/recent", selectedPeriod],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/opportunities/recent?period=${selectedPeriod}`);
      if (!res.ok) throw new Error("Failed to fetch recent opportunities");
      return await res.json();
    },
  });

  // Fetch tasks
  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["/api/tasks/today", selectedPeriod],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/tasks/today?period=${selectedPeriod}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return await res.json();
    },
  });

  // Fetch activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["/api/activities/recent", selectedPeriod],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/activities/recent?period=${selectedPeriod}`);
      if (!res.ok) throw new Error("Failed to fetch activities");
      return await res.json();
    },
  });

  // Fetch lead sources
  const { data: leadSources, isLoading: isLoadingLeadSources } = useQuery({
    queryKey: ["/api/leads/sources", selectedPeriod],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/leads/sources?period=${selectedPeriod}`);
      if (!res.ok) throw new Error("Failed to fetch lead sources");
      return await res.json();
    },
  });

  const handleNewLead = async (data: any) => {
    try {
      const leadData = {
        ...data,
        createdBy: user?.id
      };
      await apiRequest("POST", "/api/leads", leadData);
      toast({
        title: "Lead created",
        description: "New lead has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setLeadFormOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create lead",
        variant: "destructive",
      });
    }
  };

  const handleToggleTask = async (id: number, completed: boolean) => {
    try {
      await apiRequest("PATCH", `/api/tasks/${id}`, { status: completed ? "completed" : "pending" });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const viewAllOpportunities = () => setLocation("/opportunities");
  const viewAllTasks = () => setLocation("/tasks");
  const viewAllActivities = () => setLocation("/activities");
  const viewLeadSources = () => setLocation("/reports/leads");

  // Empty placeholder data (with correct structure but no values)
  const emptyStats = {
    totalLeads: { value: "0", change: 0 },
    openDeals: { value: "0", change: 0 },
    salesMtd: { value: "₹0", change: 0 },
    conversionRate: { value: "0%", change: 0 },
  };

  const emptyPipeline = {
    stages: [],
    totalValue: "₹0",
  };

  const emptyOpportunities: any[] = [];
  const emptyTasks: any[] = [];
  const emptyActivities: any[] = [];
  const emptyLeadSources: any[] = [];

  // Use API data if available, otherwise use empty placeholder data
  // We'll only use these when data is actually loaded, and show loading states instead
  const stats = dashboardStats || emptyStats;
  const pipeline = pipelineData || emptyPipeline;
  const opportunities = recentOpportunities || emptyOpportunities;
  const todayTasks = tasks || emptyTasks;
  const recentActivities = activities || emptyActivities;
  const sources = leadSources || emptyLeadSources;
  
  // Make sure nested properties exist to prevent null reference errors
  const safeStats = {
    totalLeads: { 
      value: stats?.totalLeads?.value || "0", 
      change: stats?.totalLeads?.change || 0 
    },
    openDeals: { 
      value: stats?.openDeals?.value || "0", 
      change: stats?.openDeals?.change || 0 
    },
    salesMtd: { 
      value: stats?.salesMtd?.value || "₹0", 
      change: stats?.salesMtd?.change || 0 
    },
    conversionRate: { 
      value: stats?.conversionRate?.value || "0%", 
      change: stats?.conversionRate?.change || 0 
    },
  };
  
  // Ensure pipeline data has required properties
  const safePipeline = {
    stages: pipeline?.stages || [],
    totalValue: pipeline?.totalValue || "₹0"
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Overview of your sales performance and activities</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="w-[180px]">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="thisWeek">This Week</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="lastQuarter">Last Quarter</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="lastYear">Last Year</SelectItem>
                  <SelectItem value="allTime">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => setLeadFormOpen(true)}
              className="inline-flex items-center"
            >
              <Plus className="mr-1 h-5 w-5" />
              New Lead
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Leads"
            value={safeStats.totalLeads.value}
            icon={<Megaphone size={24} />}
            change={safeStats.totalLeads.change}
          />
          <StatsCard
            title="Open Deals"
            value={safeStats.openDeals.value}
            icon={<TrendingUp size={24} />}
            change={safeStats.openDeals.change}
          />
          <StatsCard
            title="Sales (MTD)"
            value={safeStats.salesMtd.value}
            icon={<IndianRupee size={24} />}
            change={safeStats.salesMtd.change}
          />
          <StatsCard
            title="Conversion Rate"
            value={safeStats.conversionRate.value}
            icon={<BarChart2 size={24} />}
            change={safeStats.conversionRate.change}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <PipelineChart
              stages={safePipeline.stages}
              totalValue={safePipeline.totalValue}
              onViewAll={viewAllOpportunities}
            />
            
            <RecentOpportunities
              opportunities={opportunities}
              onViewAll={viewAllOpportunities}
            />
          </div>
          
          {/* Right Column (1/3 width) */}
          <div className="space-y-6">
            <TasksList
              tasks={todayTasks}
              onToggleTask={handleToggleTask}
              onAddTask={() => setLocation("/tasks/new")}
              onViewAll={viewAllTasks}
            />
            
            <ActivityTimeline
              activities={recentActivities}
              onViewAll={viewAllActivities}
            />
            
            <LeadSources
              sources={sources}
              onViewDetails={viewLeadSources}
            />
          </div>
        </div>
      </div>

      {/* New Lead Modal */}
      <LeadForm
        open={leadFormOpen}
        onOpenChange={setLeadFormOpen}
        onSubmit={handleNewLead}
      />
    </DashboardLayout>
  );
}
