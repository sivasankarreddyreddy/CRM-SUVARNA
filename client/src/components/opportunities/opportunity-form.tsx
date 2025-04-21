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
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
  isEditMode?: boolean;
  leadId?: number | null;
}

const opportunitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  companyId: z.string().min(1, "Company is required"),
  contactId: z.string().min(1, "Contact is required"),
  value: z.string().min(1, "Value is required"),
  stage: z.string().min(1, "Stage is required"),
  probability: z.string().min(1, "Probability is required"),
  expectedCloseDate: z.string().min(1, "Expected close date is required"),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  leadId: z.string().optional(),
});

export function OpportunityForm({
  isOpen,
  onClose,
  editData,
  isEditMode = false,
  leadId = null,
}: OpportunityFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch companies and contacts for dropdowns
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["/api/companies"],
  });

  const { data: contacts, isLoading: isLoadingContacts } = useQuery({
    queryKey: ["/api/contacts"],
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
  });

  // Fetch lead data if converting from a lead
  const { data: lead, isLoading: isLoadingLead } = useQuery({
    queryKey: ["/api/leads", leadId],
    enabled: !!leadId,
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
    if (isEditMode && editData) {
      // Handle edit mode
      form.reset({
        name: editData.name || "",
        companyId: editData.companyId ? editData.companyId.toString() : "",
        contactId: editData.contactId ? editData.contactId.toString() : "",
        value: editData.value || "",
        stage: editData.stage || "qualification",
        probability: editData.probability ? editData.probability.toString() : "30",
        expectedCloseDate: editData.expectedCloseDate
          ? new Date(editData.expectedCloseDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        notes: editData.notes || "",
        assignedTo: editData.assignedTo ? editData.assignedTo.toString() : user?.id.toString() || "",
      });
    } else if (lead) {
      // Handle lead conversion
      form.reset({
        name: lead.name ? `${lead.name} Opportunity` : "",
        companyId: lead.companyId ? lead.companyId.toString() : "",
        contactId: "",
        value: "",
        stage: "qualification",
        probability: "30",
        expectedCloseDate: new Date().toISOString().split("T")[0],
        notes: lead.notes || "",
        assignedTo: lead.assignedTo ? lead.assignedTo.toString() : user?.id.toString() || "",
        leadId: leadId ? leadId.toString() : "",
      });
    }
  }, [isEditMode, editData, lead, leadId, form, user]);

  // Create opportunity mutation
  const createOpportunityMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/opportunities", {
        ...data,
        createdBy: user?.id,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      toast({
        title: "Success",
        description: "Opportunity created successfully",
      });
      onClose();
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
      return await apiRequest("PATCH", `/api/opportunities/${editData.id}`, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities", editData.id] });
      toast({
        title: "Success",
        description: "Opportunity updated successfully",
      });
      onClose();
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

    if (isEditMode) {
      updateOpportunityMutation.mutate(formattedData);
    } else {
      createOpportunityMutation.mutate(formattedData);
    }
  };

  const isLoading = isLoadingCompanies || isLoadingContacts || isLoadingUsers ||
    (leadId && isLoadingLead) || createOpportunityMutation.isPending || updateOpportunityMutation.isPending;

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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {companies && companies.map((company: any) => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactId"
                render={({ field }) => (
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
                          {contacts && contacts.map((contact: any) => (
                            <SelectItem key={contact.id} value={contact.id.toString()}>
                              {contact.firstName} {contact.lastName}
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 10000" {...field} />
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
                          {users && users.map((user: any) => (
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