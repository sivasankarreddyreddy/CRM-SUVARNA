import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";

const opportunitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  companyId: z.string().min(1, "Company is required"),
  contactId: z.string().optional().nullable(),
  leadId: z.string().min(1, "Lead is required"),
  value: z.string().min(1, "Value is required"),
  stage: z.string().min(1, "Stage is required"),
  probability: z.string().min(1, "Probability is required"),
  expectedCloseDate: z.string().min(1, "Expected close date is required"),
  notes: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
});

type OpportunityFormValues = z.infer<typeof opportunitySchema>;

export default function OpportunityEditPage() {
  const [match, params] = useRoute<{ id: string }>("/opportunities/edit/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const opportunityId = match ? parseInt(params.id) : null;

  // Fetch opportunity details
  const { data: opportunity, isLoading: isLoadingOpportunity } = useQuery({
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

  // Fetch companies for dropdown
  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/companies");
      if (res.ok) {
        return await res.json();
      }
      return [];
    },
  });

  // Fetch contacts for dropdown
  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/contacts");
      if (res.ok) {
        return await res.json();
      }
      return [];
    },
  });

  // Fetch leads for dropdown
  const { data: leads = [] } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/leads");
      if (res.ok) {
        return await res.json();
      }
      return [];
    },
  });

  // Fetch users for dropdown
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users");
      if (res.ok) {
        return await res.json();
      }
      return [];
    },
  });

  // Initialize form
  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      name: "",
      companyId: "",
      contactId: "",
      leadId: "",
      value: "",
      stage: "qualification",
      probability: "30",
      expectedCloseDate: new Date().toISOString().split("T")[0],
      notes: "",
      assignedTo: "",
    },
  });

  // Update form values when opportunity data is loaded
  useEffect(() => {
    if (opportunity) {
      console.log("Resetting form with opportunity data:", opportunity);
      form.reset({
        name: opportunity.name || "",
        companyId: opportunity.companyId ? opportunity.companyId.toString() : "",
        contactId: opportunity.contactId ? opportunity.contactId.toString() : "",
        leadId: opportunity.leadId ? opportunity.leadId.toString() : "",
        value: opportunity.value ? opportunity.value.toString() : "",
        stage: opportunity.stage || "qualification",
        probability: opportunity.probability ? opportunity.probability.toString() : "30",
        expectedCloseDate: opportunity.expectedCloseDate 
          ? new Date(opportunity.expectedCloseDate).toISOString().split("T")[0] 
          : new Date().toISOString().split("T")[0],
        notes: opportunity.notes || "",
        assignedTo: opportunity.assignedTo ? opportunity.assignedTo.toString() : "",
      });
    }
  }, [opportunity, form]);

  // Update opportunity mutation
  const updateOpportunityMutation = useMutation({
    mutationFn: async (values: OpportunityFormValues) => {
      if (!opportunityId) return null;
      
      // Convert string IDs to numbers
      const payload = {
        ...values,
        companyId: values.companyId ? parseInt(values.companyId) : null,
        contactId: values.contactId ? parseInt(values.contactId) : null,
        leadId: values.leadId ? parseInt(values.leadId) : null,
        value: parseFloat(values.value),
        probability: parseInt(values.probability),
        assignedTo: values.assignedTo ? parseInt(values.assignedTo) : null,
      };
      
      console.log("Updating opportunity with payload:", payload);
      
      const res = await apiRequest("PATCH", `/api/opportunities/${opportunityId}`, payload);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update opportunity");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Opportunity updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/opportunities/${opportunityId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      navigate(`/opportunities/${opportunityId}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update opportunity: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OpportunityFormValues) => {
    updateOpportunityMutation.mutate(data);
  };

  if (!match) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto py-8">
          <div className="flex justify-center items-center h-64">
            <div>Opportunity not found</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoadingOpportunity) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse">Loading opportunity details...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate(`/opportunities/${opportunityId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Opportunity
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Edit Opportunity</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Opportunity Information</CardTitle>
            <CardDescription>
              Update the information for this opportunity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Opportunity name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stage*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="qualification">Qualification</SelectItem>
                            <SelectItem value="proposal">Proposal</SelectItem>
                            <SelectItem value="negotiation">Negotiation</SelectItem>
                            <SelectItem value="closing">Closing</SelectItem>
                            <SelectItem value="won">Won</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="leadId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lead*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select lead" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {leads.map((lead: any) => (
                              <SelectItem key={lead.id} value={lead.id.toString()}>
                                {lead.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companies.map((company: any) => (
                              <SelectItem key={company.id} value={company.id.toString()}>
                                {company.name}
                              </SelectItem>
                            ))}
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
                        <FormLabel>Contact Person</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select contact" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {contacts.map((contact: any) => (
                              <SelectItem key={contact.id} value={contact.id.toString()}>
                                {contact.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value (₹)*</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter value" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="probability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Probability (%)*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Probability percentage"
                            {...field}
                          />
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
                        <FormLabel>Expected Close Date*</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Unassigned</SelectItem>
                            {users.map((user: any) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                          placeholder="Additional notes or comments"
                          className="h-32"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/opportunities/${opportunityId}`)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateOpportunityMutation.isPending}
                  >
                    {updateOpportunityMutation.isPending ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}