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

  // Mock data for initial rendering (will be replaced by API data)
  const defaultStats = {
    totalLeads: { value: "145", change: 12.5 },
    openDeals: { value: "38", change: 8.2 },
    salesMtd: { value: "₹48,950", change: -3.1 },
    conversionRate: { value: "18.2%", change: 1.2 },
  };

  const defaultPipeline = {
    stages: [
      { name: "Qualification", value: "₹72,500", count: 32, percentage: 70, color: "rgb(59, 130, 246)" },
      { name: "Proposal", value: "₹54,200", count: 24, percentage: 60, color: "rgb(79, 70, 229)" },
      { name: "Negotiation", value: "₹31,800", count: 15, percentage: 40, color: "rgb(139, 92, 246)" },
      { name: "Closing", value: "₹24,500", count: 8, percentage: 30, color: "rgb(245, 158, 11)" },
    ],
    totalValue: "₹183,000",
  };

  const defaultOpportunities = [
    { id: 1, name: "Cloud Migration Service", company: "Acme Corp", stage: "qualification", value: "₹12,500", updatedAt: "2 days ago" },
    { id: 2, name: "ERP Implementation", company: "TechGiant Inc", stage: "negotiation", value: "₹45,000", updatedAt: "1 day ago" },
    { id: 3, name: "Security Assessment", company: "SecureData LLC", stage: "closing", value: "₹8,750", updatedAt: "3 hours ago" },
    { id: 4, name: "Digital Marketing Campaign", company: "DigiFuture Co", stage: "proposal", value: "₹18,300", updatedAt: "5 days ago" },
  ];

  const defaultTasks = [
    { id: 1, title: "Call with Acme Corp about renewal", dueTime: "10:30 AM - 11:00 AM", priority: "high", completed: false },
    { id: 2, title: "Prepare proposal for TechGiant", dueTime: "Due today", priority: "medium", completed: false },
    { id: 3, title: "Follow up with DigiFuture leads", dueTime: "2:00 PM - 3:00 PM", priority: "low", completed: false },
    { id: 4, title: "Update sales forecast for Q3", dueTime: "Due today", priority: "medium", completed: false },
  ];

  const defaultActivities = [
    { id: 1, type: "email", title: "sent a proposal to", isYou: true, target: "TechGiant Inc", time: "35 minutes ago" },
    { id: 2, type: "call", title: "Call with", target: "SecureData LLC", time: "1 hour ago" },
    { id: 3, type: "task", title: "Task completed: Update contact information", time: "3 hours ago" },
    { id: 4, type: "lead", title: "New lead: DigiFuture Co contacted via web form", time: "Yesterday at 4:23 PM" },
  ];

  const defaultLeadSources = [
    { name: "Website", percentage: 45, color: "#3b82f6" },
    { name: "Referrals", percentage: 30, color: "#4f46e5" },
    { name: "Email Campaigns", percentage: 15, color: "#f59e0b" },
    { name: "Social Media", percentage: 10, color: "#10b981" },
  ];

  // Use API data if available, otherwise use defaults
  // Ensure we have a fallback for each piece of data
  const stats = dashboardStats || defaultStats;
  const pipeline = pipelineData || defaultPipeline;
  const opportunities = recentOpportunities || defaultOpportunities;
  const todayTasks = tasks || defaultTasks;
  const recentActivities = activities || defaultActivities;
  const sources = leadSources || defaultLeadSources;
  
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
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="block w-full sm:w-auto pl-3 pr-10 py-2 text-sm rounded-md border border-slate-200 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="lastQuarter">Last Quarter</option>
              <option value="thisYear">This Year</option>
            </select>
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
