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
  UserPlus,
  Clock,
  Briefcase,
  MapPin,
  PlusCircle,
} from "lucide-react";

export default function ContactDetailsPage() {
  const [match, params] = useRoute<{ id: string }>("/contacts/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const contactId = match ? parseInt(params.id) : null;

  // Fetch contact details
  const { data: contact, isLoading } = useQuery({
    queryKey: [`/api/contacts/${contactId}`],
    queryFn: async () => {
      if (!contactId) return null;
      const res = await apiRequest("GET", `/api/contacts/${contactId}`);
      if (res.ok) {
        return await res.json();
      }
      throw new Error("Failed to fetch contact");
    },
    enabled: !!contactId,
  });

  // Fetch contact activities
  const { data: activities } = useQuery({
    queryKey: [`/api/contacts/${contactId}/activities`],
    queryFn: async () => {
      if (!contactId) return [];
      try {
        const res = await apiRequest("GET", `/api/contacts/${contactId}/activities`);
        if (res.ok) {
          return await res.json();
        }
        return [];
      } catch (error) {
        console.error("Error fetching activities:", error);
        return [];
      }
    },
    enabled: !!contactId,
  });

  // Fetch contact tasks
  const { data: tasks } = useQuery({
    queryKey: [`/api/contacts/${contactId}/tasks`],
    queryFn: async () => {
      if (!contactId) return [];
      try {
        const res = await apiRequest("GET", `/api/contacts/${contactId}/tasks`);
        if (res.ok) {
          return await res.json();
        }
        return [];
      } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
      }
    },
    enabled: !!contactId,
  });

  // Fetch contact opportunities
  const { data: opportunities } = useQuery({
    queryKey: [`/api/contacts/${contactId}/opportunities`],
    queryFn: async () => {
      if (!contactId) return [];
      try {
        const res = await apiRequest("GET", `/api/contacts/${contactId}/opportunities`);
        if (res.ok) {
          return await res.json();
        }
        return [];
      } catch (error) {
        console.error("Error fetching opportunities:", error);
        return [];
      }
    },
    enabled: !!contactId,
  });
  
  // Fetch contact leads
  const { data: leads } = useQuery({
    queryKey: [`/api/contacts/${contactId}/leads`],
    queryFn: async () => {
      if (!contactId) return [];
      try {
        const res = await apiRequest("GET", `/api/contacts/${contactId}/leads`);
        if (res.ok) {
          return await res.json();
        }
        return [];
      } catch (error) {
        console.error("Error fetching leads:", error);
        return [];
      }
    },
    enabled: !!contactId,
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async () => {
      if (!contactId) return;
      return await apiRequest("DELETE", `/api/contacts/${contactId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
      navigate("/contacts");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete contact: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if (contact) {
      navigate(`/contacts/edit/${contactId}`);
    }
  };

  const handleCreateLead = () => {
    if (contact) {
      navigate(`/leads/new?contactId=${contactId}`);
      toast({
        title: "Creating new lead",
        description: "Please fill in the lead details",
      });
    }
  };

  const handleCreateOpportunity = () => {
    if (contact) {
      // If there are leads, go directly to opportunity creation
      if (leads && leads.length > 0) {
        navigate(`/opportunities/new?contactId=${contactId}`);
        toast({
          title: "Creating new opportunity",
          description: "Please fill in the opportunity details",
        });
      } else {
        // If no leads exist, create a lead first
        handleCreateLead();
        toast({
          title: "Lead required",
          description: "An opportunity must be associated with a lead. Please create a lead first.",
        });
      }
    }
  };

  const handleAddActivity = () => {
    if (contact) {
      // If there are leads, let the user select from them in the activity form
      if (leads && leads.length > 0) {
        navigate(`/activities/new?contactId=${contactId}`);
        toast({
          title: "Adding activity",
          description: "Please select a lead and fill in the activity details",
        });
      } else {
        // If no leads exist, create a lead first
        handleCreateLead();
        toast({
          title: "Lead required",
          description: "An activity must be associated with a lead. Please create a lead first.",
        });
      }
    }
  };

  const handleAddTask = () => {
    if (contact) {
      // If there are leads, let the user select from them in the task form
      if (leads && leads.length > 0) {
        navigate(`/tasks/new?contactId=${contactId}`);
        toast({
          title: "Adding task",
          description: "Please select a lead and fill in the task details",
        });
      } else {
        // If no leads exist, create a lead first
        handleCreateLead();
        toast({
          title: "Lead required",
          description: "A task must be associated with a lead. Please create a lead first.",
        });
      }
    }
  };

  const confirmDelete = () => {
    deleteContactMutation.mutate();
  };

  if (!match) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/contacts")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contacts
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <div>Contact not found</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading || !contact) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/contacts")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contacts
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse">Loading contact details...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const fullName = `${contact.firstName} ${contact.lastName}`;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/contacts")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contacts
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{fullName}</h1>
              <div className="flex items-center mt-1">
                <span className="text-sm text-slate-500">
                  {contact.title ? `${contact.title}, ` : ""}
                  {contact.companyName || "No Company"}
                </span>
                <span className="text-sm text-slate-500 ml-3">Contact ID: {contact.id}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleCreateLead}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Lead
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
          {/* Left column - Contact details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-500">Name</div>
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 text-slate-400 mr-2" />
                    <span>{fullName}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Company</div>
                  <div className="flex items-center mt-1">
                    <Building className="h-4 w-4 text-slate-400 mr-2" />
                    <span>{contact.companyName || "-"}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Title</div>
                  <div className="flex items-center mt-1">
                    <Briefcase className="h-4 w-4 text-slate-400 mr-2" />
                    <span>{contact.title || "-"}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Email</div>
                  <div className="flex items-center mt-1">
                    <Mail className="h-4 w-4 text-slate-400 mr-2" />
                    <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                      {contact.email || "-"}
                    </a>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Phone</div>
                  <div className="flex items-center mt-1">
                    <PhoneCall className="h-4 w-4 text-slate-400 mr-2" />
                    <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                      {contact.phone || "-"}
                    </a>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Address</div>
                  <div className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 text-slate-400 mr-2" />
                    <span>{contact.address || "-"}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Created</div>
                  <div className="mt-1">
                    {new Date(contact.createdAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="activities">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="leads">Leads</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              </TabsList>
              
              <TabsContent value="leads" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Leads</CardTitle>
                      <Button size="sm" variant="outline" onClick={handleCreateLead}>
                        Create Lead
                      </Button>
                    </div>
                    <CardDescription>
                      Leads associated with this contact
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {leads && leads.length > 0 ? (
                      <div className="space-y-4">
                        {leads.map((lead: any) => (
                          <div key={lead.id} className="border-b pb-4 last:border-0">
                            <div className="flex justify-between">
                              <div className="font-medium">
                                <a 
                                  href={`/leads/${lead.id}`} 
                                  className="text-primary hover:underline"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigate(`/leads/${lead.id}`);
                                  }}
                                >
                                  {lead.title}
                                </a>
                              </div>
                              <Badge variant={
                                lead.status === 'new' ? 'default' :
                                lead.status === 'contacted' ? 'secondary' :
                                lead.status === 'qualified' ? 'outline' :
                                lead.status === 'converted' ? 'won' : 'default'
                              }>
                                {lead.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm text-slate-500 mt-1">
                              <span>Source: {lead.source || "Direct"}</span>
                              <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-2 text-sm">{lead.description}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500">
                        No leads found for this contact
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
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
                      Recent interactions with this contact
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
                        No activities found for this contact
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
                      Tasks related to this contact
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
                        No tasks found for this contact
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
                      {leads && leads.length > 0 ? (
                        <Button size="sm" variant="outline" onClick={handleCreateOpportunity}>
                          Create Opportunity
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={handleCreateLead}>
                          Create Lead First
                        </Button>
                      )}
                    </div>
                    <CardDescription>
                      Sales opportunities related to this contact
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {opportunities && opportunities.length > 0 ? (
                      <div className="space-y-4">
                        {opportunities.map((opportunity: any) => (
                          <div key={opportunity.id} className="border-b pb-4 last:border-0">
                            <div className="flex justify-between">
                              <div className="font-medium">{opportunity.name}</div>
                              <Badge variant={
                                opportunity.stage === 'qualification' ? 'qualification' :
                                opportunity.stage === 'proposal' ? 'proposal' :
                                opportunity.stage === 'negotiation' ? 'negotiation' :
                                opportunity.stage === 'closing' ? 'closing' : 'default'
                              }>
                                {opportunity.stage}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm text-slate-500 mt-1">
                              <span>Value: ${parseFloat(opportunity.value).toLocaleString()}</span>
                              <span>{new Date(opportunity.closingDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500">
                        No opportunities found for this contact
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right column - Contact related info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-slate-500 mb-1">Position</div>
                    <div className="text-sm border rounded-md py-1 px-3 bg-slate-50">
                      {contact.title || "No Title"}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-slate-500 mb-1">Company</div>
                    <div className="text-sm border rounded-md py-1 px-3 bg-slate-50">
                      {contact.companyName || "No Company"}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-slate-500 mb-1">Created</div>
                    <div className="text-sm border rounded-md py-1 px-3 bg-slate-50">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      className="w-full" 
                      onClick={handleCreateLead}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Lead
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
              This action cannot be undone. This will permanently delete the contact and all associated data.
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