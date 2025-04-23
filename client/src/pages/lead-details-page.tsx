import React, { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  PhoneCall,
  Mail,
  Building,
  Calendar,
  User,
  UserPlus,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { ActivityForm } from "@/components/activities/activity-form";
import { TaskForm } from "@/components/tasks/task-form";

export default function LeadDetailsPage() {
  const [match, params] = useRoute<{ id: string }>("/leads/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const leadId = match ? parseInt(params.id) : null;

  // Fetch lead details
  const { data: lead, isLoading } = useQuery({
    queryKey: [`/api/leads/${leadId}`],
    queryFn: async () => {
      if (!leadId) return null;
      const res = await apiRequest("GET", `/api/leads/${leadId}`);
      if (res.ok) {
        return await res.json();
      }
      throw new Error("Failed to fetch lead");
    },
    enabled: !!leadId,
  });

  // Fetch lead activities
  const { data: activities } = useQuery({
    queryKey: [`/api/leads/${leadId}/activities`],
    queryFn: async () => {
      if (!leadId) return [];
      const res = await apiRequest("GET", `/api/leads/${leadId}/activities`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    },
    enabled: !!leadId,
  });

  // Fetch lead tasks
  const { data: tasks } = useQuery({
    queryKey: [`/api/leads/${leadId}/tasks`],
    queryFn: async () => {
      if (!leadId) return [];
      const res = await apiRequest("GET", `/api/leads/${leadId}/tasks`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    },
    enabled: !!leadId,
  });
  
  // Fetch lead opportunities
  const { data: opportunities } = useQuery({
    queryKey: [`/api/leads/${leadId}/opportunities`],
    queryFn: async () => {
      if (!leadId) return [];
      const res = await apiRequest("GET", `/api/leads/${leadId}/opportunities`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    },
    enabled: !!leadId,
  });

  // Delete lead mutation
  const deleteLeadMutation = useMutation({
    mutationFn: async () => {
      if (!leadId) return;
      return await apiRequest("DELETE", `/api/leads/${leadId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
      navigate("/leads");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete lead: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if (lead) {
      navigate(`/leads/edit/${leadId}`);
    }
  };

  const handleConvertToOpportunity = () => {
    if (lead) {
      navigate(`/opportunities/new?leadId=${leadId}`);
      toast({
        title: "Converting lead to opportunity",
        description: "Please fill in the opportunity details",
      });
    }
  };

  // State for managing modal dialogs
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);

  // Import activity form and task form components at the top of the file
  const handleAddActivity = () => {
    if (lead) {
      setIsActivityFormOpen(true);
      console.log("Opening activity form for lead:", leadId);
    }
  };

  const handleAddTask = () => {
    if (lead) {
      setIsTaskFormOpen(true);
      console.log("Opening task form for lead:", leadId);
    }
  };

  const confirmDelete = () => {
    deleteLeadMutation.mutate();
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
  
  const getOpportunityStageColor = (stage: string | null | undefined) => {
    if (!stage) return "default";
    
    switch (stage.toLowerCase()) {
      case "qualification":
        return "qualification";
      case "proposal":
        return "proposal";
      case "negotiation":
        return "negotiation";
      case "won":
        return "won";
      case "lost":
        return "lost";
      default:
        return "default";
    }
  };

  if (!match) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/leads")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Leads
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <div>Lead not found</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading || !lead) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/leads")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Leads
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse">Loading lead details...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/leads")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Leads
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
              <div className="flex items-center mt-1">
                <Badge variant={getStatusColor(lead.status)}>
                  {lead.status}
                </Badge>
                <span className="text-sm text-slate-500 ml-3">Lead ID: {lead.id}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={handleAddTask}>
              <Clock className="mr-2 h-4 w-4" />
              Add Task
            </Button>
            <Button size="sm" variant="outline" onClick={handleAddActivity}>
              <Calendar className="mr-2 h-4 w-4" />
              Log Activity
            </Button>
            <Button size="sm" onClick={handleConvertToOpportunity}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Convert
            </Button>
            <Button size="sm" variant="outline" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Lead details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Information</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-500">Name</div>
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 text-slate-400 mr-2" />
                    <span>{lead.name}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Company</div>
                  <div className="flex items-center mt-1">
                    <Building className="h-4 w-4 text-slate-400 mr-2" />
                    <span>{lead.companyName || "-"}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Email</div>
                  <div className="flex items-center mt-1">
                    <Mail className="h-4 w-4 text-slate-400 mr-2" />
                    <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                      {lead.email || "-"}
                    </a>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Phone</div>
                  <div className="flex items-center mt-1">
                    <PhoneCall className="h-4 w-4 text-slate-400 mr-2" />
                    <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                      {lead.phone || "-"}
                    </a>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Source</div>
                  <div className="mt-1">
                    {lead.source || "-"}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Created</div>
                  <div className="mt-1">
                    {new Date(lead.createdAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="activities">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              </TabsList>
              
              <TabsContent value="activities" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Activities</CardTitle>
                      <Button size="sm" variant="outline" onClick={handleAddActivity}>
                        Log Activity
                      </Button>
                    </div>
                    <CardDescription>
                      Recent interactions with this lead
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activities && activities.length > 0 ? (
                      <div className="space-y-4">
                        {activities.map((activity: any) => (
                          <div key={activity.id} className="border-b pb-4 last:border-0">
                            <div className="flex justify-between">
                              <div className="font-medium">{activity.title}</div>
                              <Badge variant="outline">{activity.type}</Badge>
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                              {new Date(activity.createdAt).toLocaleString()}
                            </div>
                            <div className="mt-2 text-sm">{activity.description}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500">
                        No activities found for this lead
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="tasks" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Tasks</CardTitle>
                      <Button size="sm" variant="outline" onClick={handleAddTask}>
                        Add Task
                      </Button>
                    </div>
                    <CardDescription>
                      Tasks related to this lead
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tasks && tasks.length > 0 ? (
                      <div className="space-y-4">
                        {tasks.map((task: any) => (
                          <div key={task.id} className="border-b pb-4 last:border-0">
                            <div className="flex justify-between">
                              <div className="font-medium">{task.title}</div>
                              <Badge variant={task.completed ? "won" : "outline"}>
                                {task.completed ? "Completed" : "Pending"}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                            <div className="mt-2 text-sm">{task.description}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500">
                        No tasks found for this lead
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="opportunities" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Opportunities</CardTitle>
                      <Button size="sm" onClick={handleConvertToOpportunity}>
                        Create Opportunity
                      </Button>
                    </div>
                    <CardDescription>
                      Opportunities created from this lead
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {opportunities && opportunities.length > 0 ? (
                      <div className="space-y-4">
                        {opportunities.map((opportunity: any) => (
                          <div key={opportunity.id} className="border-b pb-4 last:border-0">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">
                                  <Link 
                                    to={`/opportunities/${opportunity.id}`}
                                    className="text-primary hover:underline"
                                  >
                                    {opportunity.name}
                                  </Link>
                                </div>
                                <div className="text-sm text-slate-500">
                                  Value: {formatCurrency(opportunity.value || 0)}
                                </div>
                              </div>
                              <Badge variant={getOpportunityStageColor(opportunity.stage)}>
                                {opportunity.stage}
                              </Badge>
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                              <div className="text-sm">
                                Closing: {new Date(opportunity.closingDate).toLocaleDateString()}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/opportunities/${opportunity.id}`)}
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500">
                        No opportunities found for this lead
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right column - Timeline and related info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-slate-500 mb-1">Current Status</div>
                    <Badge variant={getStatusColor(lead.status)} className="w-full py-1 flex justify-center">
                      {lead.status}
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-slate-500 mb-1">Lead Source</div>
                    <div className="text-sm border rounded-md py-1 px-3 bg-slate-50">
                      {lead.source || "Unknown"}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-slate-500 mb-1">Created</div>
                    <div className="text-sm border rounded-md py-1 px-3 bg-slate-50">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      className="w-full" 
                      onClick={handleConvertToOpportunity}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Convert to Opportunity
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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

      {/* Activity Form Dialog */}
      {leadId && (
        <ActivityForm 
          open={isActivityFormOpen} 
          onOpenChange={setIsActivityFormOpen} 
          leadId={leadId} 
          relatedTo="lead"
        />
      )}

      {/* Task Form Dialog */}
      {leadId && (
        <TaskForm 
          open={isTaskFormOpen} 
          onOpenChange={setIsTaskFormOpen} 
          leadId={leadId}
          relatedTo="lead"
        />
      )}
    </DashboardLayout>
  );
}