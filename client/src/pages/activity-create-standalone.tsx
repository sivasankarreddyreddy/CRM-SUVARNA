import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { insertActivitySchema, InsertActivity } from "@shared/schema";

// Extend the activity schema with date validation
const activityFormSchema = insertActivitySchema.extend({
  completedAt: z.date().optional(),
  relatedId: z.number({
    required_error: "Lead selection is required",
  }),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

export default function ActivityCreateStandalone() {
  const [, navigate] = useLocation();
  const [leadMatch, leadParams] = useRoute<{ leadId: string }>("/activity-create/:leadId");
  const [opportunityMatch, opportunityParams] = useRoute<{ opportunityId: string }>("/activity-create/opportunity/:opportunityId");
  const { toast } = useToast();

  const leadId = leadMatch && leadParams.leadId ? parseInt(leadParams.leadId) : undefined;
  const opportunityId = opportunityMatch && opportunityParams.opportunityId ? parseInt(opportunityParams.opportunityId) : undefined;
  
  // Determine if we're creating an activity for a lead or an opportunity
  const relatedEntityType = opportunityMatch ? "opportunity" : "lead";
  const relatedEntityId = opportunityId || leadId;

  // If leadId is provided, fetch the lead information
  const { data: leadData } = useQuery({
    queryKey: ['/api/leads', leadId],
    queryFn: async () => {
      if (!leadId) return null;
      const res = await apiRequest("GET", `/api/leads/${leadId}`);
      if (res.ok) {
        return await res.json();
      }
      return null;
    },
    enabled: !!leadId,
  });

  // If opportunityId is provided, fetch the opportunity information
  const { data: opportunityData } = useQuery({
    queryKey: ['/api/opportunities', opportunityId],
    queryFn: async () => {
      if (!opportunityId) return null;
      const res = await apiRequest("GET", `/api/opportunities/${opportunityId}`);
      if (res.ok) {
        return await res.json();
      }
      return null;
    },
    enabled: !!opportunityId,
  });

  // Fetch all leads for the dropdown
  const { data: leadsResponse } = useQuery({
    queryKey: ['/api/leads'],
    select: (data: any) => {
      // Handle both array and paginated response formats
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'data' in data) return data.data;
      return [];
    }
  });
  
  // Use the properly transformed leads data
  const leads = leadsResponse || [];
  
  // Fetch all opportunities for the dropdown
  const { data: opportunitiesResponse } = useQuery({
    queryKey: ['/api/opportunities'],
    select: (data: any) => {
      // Handle both array and paginated response formats
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'data' in data) return data.data;
      return [];
    }
  });
  
  // Use the properly transformed opportunities data
  const opportunities = opportunitiesResponse || [];

  // Form setup
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "call",
      relatedTo: relatedEntityType,
      relatedId: relatedEntityId,
      completedAt: new Date(),
    },
  });

  // Update form when the related entity changes
  useEffect(() => {
    console.log("Activity create - relatedEntityType:", relatedEntityType, "relatedEntityId:", relatedEntityId);

    // Set appropriate values based on the related entity type
    form.setValue("relatedTo", relatedEntityType);
    if (relatedEntityId) {
      form.setValue("relatedId", relatedEntityId);
    }
  }, [relatedEntityType, relatedEntityId, form]);

  // Handle form submission
  const createActivity = useMutation({
    mutationFn: async (data: InsertActivity) => {
      console.log("Submitting activity data:", data);
      const res = await apiRequest("POST", "/api/activities", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create activity");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Activity logged successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      if (leadId) {
        queryClient.invalidateQueries({ queryKey: [`/api/leads/${leadId}/activities`] });
        navigate(`/leads/${leadId}`); // Return to lead details page
      } else {
        navigate("/activities"); // Return to activities list
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (data: ActivityFormValues) => {
    console.log("Activity form - submitting data:", data);
    
    // Extra validation
    if (!data.title) {
      console.error("Activity form - Title is required");
      toast({
        title: "Validation Error",
        description: "Activity title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.relatedId) {
      console.error("Activity form - Lead selection is required");
      toast({
        title: "Validation Error",
        description: "Please select a lead for this activity",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get the current user from the API to set as createdBy
      const userRes = await apiRequest("GET", "/api/user");
      if (!userRes.ok) {
        throw new Error("Failed to get current user");
      }
      
      const user = await userRes.json();
      console.log("Activity form - current user:", user);

      // Create the payload with all required fields
      const payload = {
        ...data,
        relatedTo: data.relatedTo || "lead",
        createdBy: user.id,
        // Make sure completedAt is a Date object, not a string
        completedAt: data.completedAt ? new Date(data.completedAt) : new Date()
      };
      
      console.log("Activity form - final payload:", payload);
      
      // Direct API call instead of mutation
      try {
        const res = await apiRequest("POST", "/api/activities", payload);
        const responseData = await res.json();
        
        if (res.ok) {
          toast({
            title: "Success",
            description: "Activity logged successfully",
          });
          
          queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
          
          // Invalidate and navigate based on which entity we're working with
          if (leadId) {
            queryClient.invalidateQueries({ queryKey: [`/api/leads/${leadId}/activities`] });
            navigate(`/leads/${leadId}`); // Return to lead details page
          } else if (opportunityId) {
            queryClient.invalidateQueries({ queryKey: [`/api/opportunities/${opportunityId}/activities`] });
            navigate(`/opportunities/${opportunityId}`); // Return to opportunity details page
          } else {
            navigate("/activities"); // Return to activities list
          }
        } else {
          throw new Error(responseData.message || "API error response");
        }
      } catch (apiError) {
        throw apiError;
      }
    } catch (error) {
      console.error("Activity form - submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit activity: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            onClick={() => {
              if (leadId) {
                navigate(`/leads/${leadId}`);
              } else if (opportunityId) {
                navigate(`/opportunities/${opportunityId}`);
              } else {
                navigate("/activities");
              }
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Log New Activity</h1>
        </div>

        <div className="bg-card rounded-lg shadow p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter activity title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="call">Phone Call</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="note">Note</SelectItem>
                          <SelectItem value="task">Task</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="completedAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date Completed</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={
                                "w-full pl-3 text-left font-normal " +
                                (!field.value && "text-muted-foreground")
                              }
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {opportunityId ? (
                <FormField
                  control={form.control}
                  name="relatedId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opportunity *</FormLabel>
                      <Select 
                        value={field.value ? field.value.toString() : opportunityId?.toString()}
                        disabled={true} // Always disabled when creating from opportunity
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select opportunity">
                              {opportunityData?.name || `Opportunity #${opportunityId}`}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                      </Select>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">
                        This activity will be associated with the selected opportunity
                      </p>
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="relatedId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Lead *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(parseInt(value));
                          // Set relatedTo to 'lead' when a lead is selected
                          form.setValue("relatedTo", "lead");
                          console.log("Activity form - selected lead ID:", value);
                        }}
                        value={field.value ? field.value.toString() : undefined}
                        disabled={!!leadId} // Disable if lead ID is provided in URL
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select lead" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(leads) && leads.length > 0 ? (
                            leads.map((lead: any) => (
                              <SelectItem key={lead.id} value={lead.id.toString()}>
                                {lead.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no_leads_placeholder" disabled>No leads available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">
                        Activities must be associated with a lead or opportunity for proper tracking
                      </p>
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter activity details" 
                        value={field.value || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        name={field.name}
                        className="min-h-[150px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => {
                    if (leadId) {
                      navigate(`/leads/${leadId}`);
                    } else if (opportunityId) {
                      navigate(`/opportunities/${opportunityId}`);
                    } else {
                      navigate("/activities");
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(form.getValues());
                  }}
                >
                  Save Activity
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
}