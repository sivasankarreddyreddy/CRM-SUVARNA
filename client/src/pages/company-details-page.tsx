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
  Globe,
  UserPlus,
  Clock,
  Briefcase,
  MapPin,
  Users,
  PlusCircle
} from "lucide-react";

export default function CompanyDetailsPage() {
  const [match, params] = useRoute<{ id: string }>("/companies/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const companyId = match ? parseInt(params.id) : null;

  // Fetch company details
  const { data: company, isLoading } = useQuery({
    queryKey: [`/api/companies/${companyId}`],
    queryFn: async () => {
      if (!companyId) return null;
      const res = await apiRequest("GET", `/api/companies/${companyId}`);
      if (res.ok) {
        return await res.json();
      }
      throw new Error("Failed to fetch company");
    },
    enabled: !!companyId,
  });

  // Fetch company contacts
  const { data: contacts } = useQuery({
    queryKey: [`/api/companies/${companyId}/contacts`],
    queryFn: async () => {
      if (!companyId) return [];
      try {
        const res = await apiRequest("GET", `/api/companies/${companyId}/contacts`);
        if (res.ok) {
          return await res.json();
        }
        return [];
      } catch (error) {
        console.error("Error fetching contacts:", error);
        return [];
      }
    },
    enabled: !!companyId,
  });

  // Fetch company opportunities
  const { data: opportunities } = useQuery({
    queryKey: [`/api/companies/${companyId}/opportunities`],
    queryFn: async () => {
      if (!companyId) return [];
      try {
        const res = await apiRequest("GET", `/api/companies/${companyId}/opportunities`);
        if (res.ok) {
          return await res.json();
        }
        return [];
      } catch (error) {
        console.error("Error fetching opportunities:", error);
        return [];
      }
    },
    enabled: !!companyId,
  });
  
  // Fetch company leads
  const { data: leads } = useQuery({
    queryKey: [`/api/companies/${companyId}/leads`],
    queryFn: async () => {
      if (!companyId) return [];
      try {
        const res = await apiRequest("GET", `/api/companies/${companyId}/leads`);
        if (res.ok) {
          return await res.json();
        }
        return [];
      } catch (error) {
        console.error("Error fetching leads:", error);
        return [];
      }
    },
    enabled: !!companyId,
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async () => {
      if (!companyId) return;
      return await apiRequest("DELETE", `/api/companies/${companyId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
      navigate("/companies");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete company: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if (company) {
      navigate(`/companies/edit/${companyId}`);
    }
  };

  const handleCreateContact = () => {
    if (company) {
      navigate(`/contacts/new?companyId=${companyId}`);
      toast({
        title: "Adding contact",
        description: "Please fill in the contact details",
      });
    }
  };

  const handleCreateLead = () => {
    if (company) {
      navigate(`/leads/new?companyId=${companyId}`);
      toast({
        title: "Creating new lead",
        description: "Please fill in the lead details",
      });
    }
  };

  const handleCreateOpportunity = () => {
    if (company) {
      // If there are leads, go directly to opportunity creation
      if (leads && leads.length > 0) {
        navigate(`/opportunities/new?companyId=${companyId}`);
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

  const confirmDelete = () => {
    deleteCompanyMutation.mutate();
  };

  if (!match) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/companies")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Companies
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <div>Company not found</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading || !company) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/companies")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Companies
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse">Loading company details...</div>
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
            <Button variant="outline" size="sm" onClick={() => navigate("/companies")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Companies
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
              <div className="flex items-center mt-1">
                <span className="text-sm text-slate-500">
                  {company.industry || "No Industry"}
                </span>
                <span className="text-sm text-slate-500 ml-3">Company ID: {company.id}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={handleCreateContact}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
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
          {/* Left column - Company details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-500">Name</div>
                  <div className="flex items-center mt-1">
                    <Building className="h-4 w-4 text-slate-400 mr-2" />
                    <span>{company.name}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Industry</div>
                  <div className="flex items-center mt-1">
                    <Briefcase className="h-4 w-4 text-slate-400 mr-2" />
                    <span>{company.industry || "-"}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Website</div>
                  <div className="flex items-center mt-1">
                    <Globe className="h-4 w-4 text-slate-400 mr-2" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {company.website || "-"}
                    </a>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Phone</div>
                  <div className="flex items-center mt-1">
                    <PhoneCall className="h-4 w-4 text-slate-400 mr-2" />
                    <a href={`tel:${company.phone}`} className="text-primary hover:underline">
                      {company.phone || "-"}
                    </a>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Email</div>
                  <div className="flex items-center mt-1">
                    <Mail className="h-4 w-4 text-slate-400 mr-2" />
                    <a href={`mailto:${company.email}`} className="text-primary hover:underline">
                      {company.email || "-"}
                    </a>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Address</div>
                  <div className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 text-slate-400 mr-2" />
                    <span>{company.address || "-"}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-500">Created</div>
                  <div className="mt-1">
                    {new Date(company.createdAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="contacts">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              </TabsList>
              
              <TabsContent value="contacts" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Contacts</CardTitle>
                      <Button size="sm" variant="outline" onClick={handleCreateContact}>
                        Add Contact
                      </Button>
                    </div>
                    <CardDescription>
                      People associated with this company
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {contacts && contacts.length > 0 ? (
                      <div className="space-y-4">
                        {contacts.map((contact: any) => (
                          <div key={contact.id} className="border-b pb-4 last:border-0">
                            <div className="flex justify-between">
                              <div className="font-medium">{`${contact.firstName} ${contact.lastName}`}</div>
                              <Badge variant="outline">{contact.title || "No Title"}</Badge>
                            </div>
                            <div className="mt-1 flex items-center">
                              <Mail className="h-3 w-3 text-slate-400 mr-1" />
                              <a href={`mailto:${contact.email}`} className="text-sm text-primary hover:underline mr-4">
                                {contact.email}
                              </a>
                              {contact.phone && (
                                <>
                                  <PhoneCall className="h-3 w-3 text-slate-400 mr-1" />
                                  <a href={`tel:${contact.phone}`} className="text-sm text-primary hover:underline">
                                    {contact.phone}
                                  </a>
                                </>
                              )}
                            </div>
                            <div className="mt-2 flex justify-end">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => navigate(`/contacts/${contact.id}`)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500">
                        No contacts found for this company
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
                      Sales opportunities with this company
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
                              <span>Closing: {new Date(opportunity.closingDate).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-2 flex justify-end">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => navigate(`/opportunities/${opportunity.id}`)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500">
                        No opportunities found for this company
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right column - Company related info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-slate-500 mb-1">Industry</div>
                    <div className="text-sm border rounded-md py-1 px-3 bg-slate-50">
                      {company.industry || "Not specified"}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-slate-500 mb-1">Size</div>
                    <div className="text-sm border rounded-md py-1 px-3 bg-slate-50">
                      {company.employeeCount ? `${company.employeeCount} employees` : "Unknown"}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-slate-500 mb-1">Created</div>
                    <div className="text-sm border rounded-md py-1 px-3 bg-slate-50">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      className="w-full" 
                      onClick={handleCreateContact}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Contact Count
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <span className="text-4xl font-bold">
                    {contacts ? contacts.length : 0}
                  </span>
                  <p className="text-sm text-slate-500 mt-1">Total contacts</p>
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
              This action cannot be undone. This will permanently delete the company and may affect associated contacts and opportunities.
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