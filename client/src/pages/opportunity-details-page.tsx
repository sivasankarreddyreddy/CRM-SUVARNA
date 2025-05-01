import React, { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  Clock,
  Briefcase,
  DollarSign,
  FileText,
  ClipboardList,
  CheckSquare,
  ExternalLink,
  ShoppingCart,
} from "lucide-react";

export default function OpportunityDetailsPage() {
  const [match, params] = useRoute<{ id: string }>("/opportunities/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const opportunityId = match ? parseInt(params.id) : null;

  // Fetch opportunity details
  const { data: opportunity, isLoading } = useQuery({
    queryKey: [`/api/opportunities/${opportunityId}`],
    queryFn: async () => {
      if (!opportunityId) return null;
      const res = await apiRequest("GET", `/api/opportunities/${opportunityId}`);
      if (res.ok) {
        return await res.json();
      }
      throw new Error("Failed to fetch opportunity");
    },
    enabled: !!opportunityId,
  });
  
  // Fetch related lead if leadId exists
  const { data: relatedLead } = useQuery({
    queryKey: [`/api/leads/${opportunity?.leadId}`],
    queryFn: async () => {
      if (!opportunity?.leadId) return null;
      const res = await apiRequest("GET", `/api/leads/${opportunity.leadId}`);
      if (res.ok) {
        return await res.json();
      }
      return null;
    },
    enabled: !!opportunity?.leadId,
  });
  
  // Fetch related quotations
  const { data: relatedQuotations } = useQuery({
    queryKey: [`/api/opportunities/${opportunityId}/quotations`],
    queryFn: async () => {
      if (!opportunityId) return [];
      try {
        const res = await apiRequest("GET", `/api/opportunities/${opportunityId}/quotations`);
        if (res.ok) {
          return await res.json();
        }
        return [];
      } catch (error) {
        console.error("Error fetching quotations:", error);
        return [];
      }
    },
    enabled: !!opportunityId,
  });

  // Fetch opportunity activities
  const { data: activities } = useQuery({
    queryKey: [`/api/opportunities/${opportunityId}/activities`],
    queryFn: async () => {
      if (!opportunityId) return [];
      try {
        const res = await apiRequest("GET", `/api/opportunities/${opportunityId}/activities`);
        if (res.ok) {
          return await res.json();
        }
        return [];
      } catch (error) {
        console.error("Error fetching activities:", error);
        return [];
      }
    },
    enabled: !!opportunityId,
  });

  // Fetch opportunity tasks
  const { data: tasks } = useQuery({
    queryKey: [`/api/opportunities/${opportunityId}/tasks`],
    queryFn: async () => {
      if (!opportunityId) return [];
      try {
        const res = await apiRequest("GET", `/api/opportunities/${opportunityId}/tasks`);
        if (res.ok) {
          return await res.json();
        }
        return [];
      } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
      }
    },
    enabled: !!opportunityId,
  });

  // Delete opportunity mutation
  const deleteOpportunityMutation = useMutation({
    mutationFn: async () => {
      if (!opportunityId) return;
      return await apiRequest("DELETE", `/api/opportunities/${opportunityId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Opportunity deleted successfully",
      });
      navigate("/opportunities");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete opportunity: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if (opportunity) {
      navigate(`/opportunities/edit/${opportunityId}`);
    }
  };

  const handleCreateQuotation = () => {
    if (opportunity) {
      navigate(`/quotations/new?opportunityId=${opportunityId}`);
      toast({
        title: "Creating quotation",
        description: "Please fill in the quotation details",
      });
    }
  };

  const handleAddActivity = () => {
    if (opportunity) {
      navigate(`/activity-create/opportunity/${opportunityId}`);
      toast({
        title: "Adding activity",
        description: "Please fill in the activity details",
      });
    }
  };

  const handleAddTask = () => {
    if (opportunity) {
      navigate(`/task-create/opportunity/${opportunityId}`);
      toast({
        title: "Adding task",
        description: "Please fill in the task details",
      });
    }
  };

  const confirmDelete = () => {
    deleteOpportunityMutation.mutate();
  };

  const getStageVariant = (stage: string | null | undefined) => {
    if (!stage) return "default";
    
    switch (stage.toLowerCase()) {
      case "qualification":
        return "qualification";
      case "proposal":
        return "proposal";
      case "negotiation":
        return "negotiation";
      case "closing":
        return "closing";
      default:
        return "default";
    }
  };

  if (!match) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/opportunities")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Opportunities
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <div>Opportunity not found</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading || !opportunity) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/opportunities")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Opportunities
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse">Loading opportunity details...</div>
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
            <Button variant="outline" size="sm" onClick={() => navigate("/opportunities")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Opportunities
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{opportunity.name}</h1>
              <div className="flex items-center mt-1">
                <Badge variant={getStageVariant(opportunity.stage)}>
                  {opportunity.stage}
                </Badge>
                <span className="text-sm text-slate-500 ml-3">ID: {opportunity.id}</span>
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
            <Button size="sm" onClick={handleCreateQuotation}>
              <FileText className="mr-2 h-4 w-4" />
              Create Quotation
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
          {/* Left column - Opportunity details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Information</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-500">Name</div>
                  <div className="flex items-center mt-1">
                    <Briefcase className="h-4 w-4 text-slate-400 mr-2" />
                    <span>{opportunity.name}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Company</div>
                  <div className="flex items-center mt-1">
                    <Building className="h-4 w-4 text-slate-400 mr-2" />
                    <span>{opportunity.companyName || "-"}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Contact</div>
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 text-slate-400 mr-2" />
                    <span>{opportunity.contactName || "-"}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Value</div>
                  <div className="flex items-center mt-1">
                    <span className="text-slate-400 mr-2">₹</span>
                    <span>{parseFloat(opportunity.value).toLocaleString()}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Closing Date</div>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                    <span>{new Date(opportunity.closingDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Created</div>
                  <div className="mt-1">
                    {new Date(opportunity.createdAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="activities">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="quotations">
                  Quotations {relatedQuotations?.length > 0 && `(${relatedQuotations.length})`}
                </TabsTrigger>
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
                      Recent interactions related to this opportunity
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
                        No activities found for this opportunity
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
                      Tasks related to this opportunity
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
                        No tasks found for this opportunity
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="quotations" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Quotations</CardTitle>
                      <Button size="sm" onClick={handleCreateQuotation}>
                        <FileText className="mr-2 h-4 w-4" />
                        Create Quotation
                      </Button>
                    </div>
                    <CardDescription>
                      Quotations created from this opportunity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {relatedQuotations && relatedQuotations.length > 0 ? (
                      <div className="space-y-4">
                        {relatedQuotations.map((quotation: any) => (
                          <div 
                            key={quotation.id} 
                            className="border rounded-md p-4 hover:bg-slate-50 cursor-pointer"
                            onClick={() => navigate(`/quotations/${quotation.id}`)}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="font-medium text-primary">
                                #{quotation.quotationNumber}
                              </div>
                              <Badge variant={
                                quotation.status === "accepted" ? "won" : 
                                quotation.status === "rejected" ? "lost" : 
                                quotation.status === "sent" ? "proposal" : "default"
                              }>
                                {quotation.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                              <div>
                                <span className="text-slate-500">Total: </span>
                                <span className="font-medium">₹{parseFloat(quotation.total).toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">Valid until: </span>
                                <span>{new Date(quotation.validUntil).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                              <div className="text-xs text-slate-500">
                                Created: {new Date(quotation.createdAt).toLocaleDateString()}
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-7 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/quotations/${quotation.id}`);
                                  }}
                                >
                                  View
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-7 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/orders/new?quotationId=${quotation.id}`);
                                  }}
                                >
                                  Convert to Order
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500">
                        No quotations found for this opportunity
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right column - Opportunity related info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-slate-500 mb-1">Current Stage</div>
                    <Badge variant={getStageVariant(opportunity.stage)} className="w-full py-1 flex justify-center">
                      {opportunity.stage}
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-slate-500 mb-1">Probability</div>
                    <div className="text-sm border rounded-md py-1 px-3 bg-slate-50">
                      {opportunity.probability ? `${opportunity.probability}%` : "Not set"}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-slate-500 mb-1">Closing Date</div>
                    <div className="text-sm border rounded-md py-1 px-3 bg-slate-50">
                      {new Date(opportunity.closingDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {relatedLead && (
                    <div>
                      <div className="text-sm font-medium text-slate-500 mb-1">Source Lead</div>
                      <div className="text-sm border rounded-md py-1 px-3 bg-slate-50 hover:bg-slate-100 cursor-pointer"
                           onClick={() => navigate(`/leads/${relatedLead.id}`)}>
                        <div className="flex items-center justify-between">
                          <span>{relatedLead.name}</span>
                          <ExternalLink className="h-3 w-3 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <Button 
                      className="w-full" 
                      onClick={handleCreateQuotation}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Create Quotation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="h-5 w-5 mr-2">₹</span>
                  Opportunity Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <span className="text-3xl font-bold">
                    ₹{parseFloat(opportunity.value).toLocaleString()}
                  </span>
                  <p className="text-sm text-slate-500 mt-2">Expected revenue from this opportunity</p>
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