import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface OpportunityFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  editData?: any;
  initialData?: any;
  isEditMode?: boolean;
  leadId?: number | null;
  onSubmit?: (data: any) => void;
  isSubmitting?: boolean;
}

const opportunitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  companyId: z.string(),
  contactId: z.string(),
  value: z.string().min(1, "Value is required"),
  stage: z.string().min(1, "Stage is required"),
  probability: z.string(),
  expectedCloseDate: z.string().min(1, "Expected close date is required"),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  leadId: z.string().min(1, "Lead selection is required"),
});

export function OpportunityForm({
  isOpen,
  onClose,
  editData,
  initialData,
  isEditMode = false,
  leadId = null,
  onSubmit: externalSubmit,
  isSubmitting: externalIsSubmitting,
}: OpportunityFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch companies, contacts, and leads for dropdowns
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["/api/companies"],
  });

  const { data: contacts, isLoading: isLoadingContacts } = useQuery({
    queryKey: ["/api/contacts"],
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
  });
  
  // Fetch all leads for lead selection
  const { data: leads, isLoading: isLoadingLeads } = useQuery({
    queryKey: ["/api/leads"],
  });

  // Fetch lead data if converting from a lead or if lead is selected
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leadId ? leadId.toString() : "");
  
  const { data: selectedLead, isLoading: isLoadingSelectedLead } = useQuery({
    queryKey: ["/api/leads", selectedLeadId ? parseInt(selectedLeadId) : null],
    enabled: !!selectedLeadId,
  });

  const form = useForm<z.infer<typeof opportunitySchema>>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      name: "",
      companyId: "",
      contactId: "",
      value: "",
      stage: "qualification",
      probability: "30",
      expectedCloseDate: new Date().toISOString().split("T")[0],
      notes: "",
      assignedTo: user?.id.toString() || "",
      leadId: leadId ? leadId.toString() : "",
    },
  });

  // Pre-fill form with edit data or lead data
  useEffect(() => {
    const dataSource = initialData || editData;
    if (isEditMode && dataSource) {
      // Handle edit mode
      setSelectedLeadId(dataSource.leadId ? dataSource.leadId.toString() : "");
      form.reset({
        name: dataSource.name || "",
        companyId: dataSource.companyId ? dataSource.companyId.toString() : "",
        contactId: dataSource.contactId ? dataSource.contactId.toString() : "",
        value: dataSource.value || "",
        stage: dataSource.stage || "qualification",
        probability: dataSource.probability ? dataSource.probability.toString() : "30",
        expectedCloseDate: dataSource.expectedCloseDate
          ? new Date(dataSource.expectedCloseDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        notes: dataSource.notes || "",
        assignedTo: dataSource.assignedTo ? dataSource.assignedTo.toString() : user?.id.toString() || "",
        leadId: dataSource.leadId ? dataSource.leadId.toString() : "",
      });
    } else if (leadId) {
      // When converting from a lead, pre-fill data from the lead
      setSelectedLeadId(leadId.toString());
    }
  }, [isEditMode, editData, initialData, leadId, form, user]);
  
  // Update company and contact fields when selected lead changes
  useEffect(() => {
    if (selectedLead) {
      const leadData = selectedLead as any;
      console.log("Selected lead data:", leadData);
      
      // Handle company information
      // First check if the lead has a companyId
      if (leadData.companyId) {
        console.log("Setting companyId from lead:", leadData.companyId);
        form.setValue("companyId", leadData.companyId.toString());
      } 
      // Then check if it has a companyName and try to find a matching company
      else if (leadData.companyName && companies && Array.isArray(companies)) {
        // Try to find the company by name if we have a companyName but no companyId
        const company = companies.find((c: any) => 
          c.name.toLowerCase() === leadData.companyName.toLowerCase()
        );
        if (company) {
          console.log("Found company by name:", company);
          form.setValue("companyId", company.id.toString());
        } else {
          // If we can't find a company by name, try to create a temporary company ID
          console.log("Company not found by exact name, trying partial match");
          // Try a partial match if exact match fails
          const partialMatch = companies.find((c: any) => 
            c.name.toLowerCase().includes(leadData.companyName.toLowerCase()) ||
            leadData.companyName.toLowerCase().includes(c.name.toLowerCase())
          );
          
          if (partialMatch) {
            console.log("Found partial company match:", partialMatch);
            form.setValue("companyId", partialMatch.id.toString());
          } else if (companies.length > 0) {
            // As a fallback, use the first company in the list
            console.log("Using first company as fallback:", companies[0]);
            form.setValue("companyId", companies[0].id.toString());
          }
        }
      }
      
      // Handle contact information - try to find a contact that matches the lead information
      if (contacts && Array.isArray(contacts) && contacts.length > 0) {
        let matchingContact = null;
        
        // First try to find by email if available
        if (leadData.email) {
          matchingContact = contacts.find((c: any) => 
            c.email && c.email.toLowerCase() === leadData.email.toLowerCase()
          );
          
          if (matchingContact) {
            console.log("Found matching contact by email:", matchingContact);
          }
        }
        
        // If no match by email, try to find by name
        if (!matchingContact && leadData.name) {
          // Try to match with either firstName or lastName
          matchingContact = contacts.find((c: any) => {
            const leadName = leadData.name.toLowerCase();
            const fullContactName = `${c.firstName} ${c.lastName}`.toLowerCase();
            return fullContactName.includes(leadName) || leadName.includes(fullContactName);
          });
          
          if (matchingContact) {
            console.log("Found matching contact by name:", matchingContact);
          }
        }
        
        // If we found a matching contact, set it
        if (matchingContact) {
          form.setValue("contactId", matchingContact.id.toString());
        } else if (contacts.length > 0) {
          // As a fallback, use the first contact in the list
          console.log("Using first contact as fallback:", contacts[0]);
          form.setValue("contactId", contacts[0].id.toString());
        }
      }
      
      // If this is a new opportunity or lead conversion, also update other fields
      if (!isEditMode || leadId) {
        form.setValue("name", leadData.name ? `${leadData.name} Opportunity` : "");
        form.setValue("notes", leadData.notes || "");
        form.setValue("assignedTo", leadData.assignedTo ? leadData.assignedTo.toString() : user?.id.toString() || "");
        // Set a default value for the opportunity
        form.setValue("value", "10000");
      }
    }
  }, [selectedLead, form, isEditMode, leadId, user, companies, contacts]);

  // Create opportunity mutation
  const createOpportunityMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/opportunities", {
        ...data,
        createdBy: user?.id,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create opportunity");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      toast({
        title: "Success",
        description: "Opportunity created successfully",
      });
      
      if (onClose) {
        onClose();
      }
      
      navigate(`/opportunities/${data.id}`);
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
      const dataSource = initialData || editData;
      if (!dataSource || !dataSource.id) {
        throw new Error("No opportunity ID found for update");
      }
      
      const response = await apiRequest("PATCH", `/api/opportunities/${dataSource.id}`, data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update opportunity");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      const dataSource = initialData || editData;
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      if (dataSource && dataSource.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/opportunities", dataSource.id] });
      }
      
      toast({
        title: "Success",
        description: "Opportunity updated successfully",
      });
      
      if (onClose) {
        onClose();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update opportunity: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof opportunitySchema>) => {
    // Convert string values to appropriate types
    const formattedData = {
      name: data.name,
      companyId: data.companyId ? parseInt(data.companyId) : null,
      contactId: data.contactId ? parseInt(data.contactId) : null,
      value: data.value,
      stage: data.stage,
      probability: data.probability ? parseInt(data.probability) : 0,
      expectedCloseDate: new Date(data.expectedCloseDate),
      notes: data.notes || null,
      assignedTo: data.assignedTo ? parseInt(data.assignedTo) : null,
      leadId: data.leadId ? parseInt(data.leadId) : null,
      createdBy: user?.id,
    };

    // If external submit function is provided, use it instead of the built-in mutations
    if (externalSubmit) {
      externalSubmit(formattedData);
    } else if (isEditMode) {
      updateOpportunityMutation.mutate(formattedData);
    } else {
      createOpportunityMutation.mutate(formattedData);
    }
  };

  const isLoading = isLoadingCompanies || isLoadingContacts || isLoadingUsers || isLoadingLeads ||
    isLoadingSelectedLead || createOpportunityMutation.isPending || updateOpportunityMutation.isPending;

  // For the standalone form (not in dialog), render without dialog wrapper
  if (isOpen === undefined) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opportunity Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Opportunity name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => {
                let companyName = "Select a lead first";
                let companyId = "";
                
                // First try to find the company based on the selected companyId
                if (field.value && Array.isArray(companies)) {
                  const selectedCompany = companies.find((c: any) => c.id.toString() === field.value);
                  if (selectedCompany) {
                    companyName = selectedCompany.name;
                    companyId = selectedCompany.id.toString();
                  }
                }
                
                // If no company was found by ID but we have a selected lead with companyName
                if ((companyName === "Select a lead first" || !companyId) && selectedLead) {
                  if ((selectedLead as any).companyName) {
                    companyName = (selectedLead as any).companyName;
                    
                    // Try to find matching company in database by name
                    if (companies && Array.isArray(companies)) {
                      const matchingCompany = companies.find(
                        (c: any) => c.name.toLowerCase() === companyName.toLowerCase()
                      );
                      if (matchingCompany) {
                        companyId = matchingCompany.id.toString();
                        // Update form value if we found a matching company ID
                        if (companyId && companyId !== field.value) {
                          setTimeout(() => {
                            form.setValue("companyId", companyId);
                          }, 0);
                        }
                      }
                    }
                  }
                }
                
                return (
                  <FormItem>
                    <FormLabel>Company *</FormLabel>
                    <FormControl>
                      <Input 
                        value={companyName} 
                        disabled 
                        className="bg-muted cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      {companyId 
                        ? `Using company ID: ${companyId} (${companyName})`
                        : "Company from lead without ID - will be stored as text only"}
                    </p>
                  </FormItem>
                );
              }}
            />

            {/* All the other form fields */}
            {/* Form buttons for the standalone form */}
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                type="submit"
                disabled={updateOpportunityMutation.isPending || createOpportunityMutation.isPending || externalIsSubmitting || isLoading}
              >
                {(updateOpportunityMutation.isPending || createOpportunityMutation.isPending || externalIsSubmitting) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    );
  }

  // For dialog mode
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Opportunity" : leadId ? "Convert Lead to Opportunity" : "Create New Opportunity"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opportunity Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Opportunity name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => {
                  let companyName = "Select a lead first";
                  let companyId = "";
                  
                  // First try to find the company based on the selected companyId
                  if (field.value && Array.isArray(companies)) {
                    const selectedCompany = companies.find((c: any) => c.id.toString() === field.value);
                    if (selectedCompany) {
                      companyName = selectedCompany.name;
                      companyId = selectedCompany.id.toString();
                    }
                  }
                  
                  // If no company was found by ID but we have a selected lead with companyName
                  if ((companyName === "Select a lead first" || !companyId) && selectedLead) {
                    if ((selectedLead as any).companyName) {
                      companyName = (selectedLead as any).companyName;
                      
                      // Try to find matching company in database by name
                      if (companies && Array.isArray(companies)) {
                        const matchingCompany = companies.find(
                          (c: any) => c.name.toLowerCase() === companyName.toLowerCase()
                        );
                        if (matchingCompany) {
                          companyId = matchingCompany.id.toString();
                          // Update form value if we found a matching company ID
                          if (companyId && companyId !== field.value) {
                            setTimeout(() => {
                              form.setValue("companyId", companyId);
                            }, 0);
                          }
                        }
                      }
                    }
                  }
                  
                  return (
                    <FormItem>
                      <FormLabel>Company *</FormLabel>
                      <FormControl>
                        <Input 
                          value={companyName} 
                          disabled 
                          className="bg-muted cursor-not-allowed"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">
                        {companyId 
                          ? `Using company ID: ${companyId} (${companyName})`
                          : "Company from lead without ID - will be stored as text only"}
                      </p>
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="contactId"
                render={({ field }) => {
                  // If we have a lead selected with a contactId, display contact info as read-only
                  if (selectedLead && (selectedLead as any).contactId) {
                    let contactName = "Contact information unavailable";
                    
                    // Try to find contact name from contacts array
                    if (Array.isArray(contacts) && field.value) {
                      const selectedContact = contacts.find((c: any) => c.id.toString() === field.value);
                      if (selectedContact) {
                        contactName = `${selectedContact.firstName} ${selectedContact.lastName}`;
                      }
                    }
                    
                    return (
                      <FormItem>
                        <FormLabel>Contact * (Auto-populated from Lead)</FormLabel>
                        <FormControl>
                          <Input 
                            value={contactName} 
                            disabled 
                            className="bg-muted cursor-not-allowed"
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground mt-1">
                          Contact information comes from the selected lead
                        </p>
                      </FormItem>
                    );
                  }
                  
                  // Otherwise, display normal select dropdown
                  return (
                    <FormItem>
                      <FormLabel>Contact *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select contact" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {Array.isArray(contacts) && contacts.map((contact: any) => (
                              <SelectItem key={contact.id} value={contact.id.toString()}>
                                {contact.firstName} {contact.lastName}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value (₹) *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2">₹</span>
                        <Input placeholder="e.g. 100000" className="pl-7" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {Array.isArray(users) && users.map((user: any) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.fullName}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="qualification">Qualification</SelectItem>
                          <SelectItem value="proposal">Proposal</SelectItem>
                          <SelectItem value="negotiation">Negotiation</SelectItem>
                          <SelectItem value="closing">Closing</SelectItem>
                          <SelectItem value="won">Won</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="probability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Probability (%) *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedCloseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Close Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="leadId"
              render={({ field }) => {
                const selectedLeadName = Array.isArray(leads) ? 
                  leads.find((l: any) => l.id.toString() === field.value)?.name : "";
                
                // If launched with a specific leadId (lead conversion), show a read-only field
                if (leadId) {
                  return (
                    <FormItem>
                      <FormLabel>Related Lead *</FormLabel>
                      <FormControl>
                        <Input 
                          value={selectedLeadName || ""}
                          disabled
                          className="bg-muted cursor-not-allowed"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">
                        This opportunity is linked to the lead you're converting
                      </p>
                    </FormItem>
                  );
                }
                
                // Otherwise, show selectable dropdown for normal opportunity creation
                return (
                  <FormItem>
                    <FormLabel>Related Lead *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedLeadId(value); // Update the selectedLeadId state to trigger company update
                      }}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {Array.isArray(leads) && leads.map((lead: any) => (
                            <SelectItem key={lead.id} value={lead.id.toString()}>
                              {lead.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      Selecting a lead will automatically set the company
                    </p>
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add more details about this opportunity"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Update" : "Create"} Opportunity
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}