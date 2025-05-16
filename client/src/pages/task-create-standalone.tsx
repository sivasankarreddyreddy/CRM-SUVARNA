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
import { insertTaskSchema, InsertTask } from "@shared/schema";

// Extend the task schema with date validation
const taskFormSchema = insertTaskSchema.extend({
  dueDate: z.date().optional(),
  relatedId: z.number({
    required_error: "Lead selection is required",
  }),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export default function TaskCreateStandalone() {
  const [, navigate] = useLocation();
  const [leadMatch, leadParams] = useRoute<{ leadId: string }>("/task-create/:leadId");
  const [opportunityMatch, opportunityParams] = useRoute<{ opportunityId: string }>("/task-create/opportunity/:opportunityId");
  const { toast } = useToast();

  const leadId = leadMatch && leadParams.leadId ? parseInt(leadParams.leadId) : undefined;
  const opportunityId = opportunityMatch && opportunityParams.opportunityId ? parseInt(opportunityParams.opportunityId) : undefined;
  
  // Determine if we're creating a task for a lead or an opportunity
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
  });
  
  // Convert leads data to the expected array format
  const leads = leadsResponse && 'data' in leadsResponse ? leadsResponse.data : [];
  
  // Fetch all opportunities for the dropdown
  const { data: opportunitiesResponse } = useQuery({
    queryKey: ['/api/opportunities'],
  });
  
  // Convert opportunities data to the expected array format
  const opportunities = opportunitiesResponse && 'data' in opportunitiesResponse ? opportunitiesResponse.data : [];

  // Form setup
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      relatedTo: relatedEntityType,
      relatedId: relatedEntityId,
      assignedTo: undefined,
      dueDate: undefined,
    },
  });

  // Update form when the related entity changes
  useEffect(() => {
    console.log("Task create - relatedEntityType:", relatedEntityType, "relatedEntityId:", relatedEntityId);

    // Set appropriate values based on the related entity type
    form.setValue("relatedTo", relatedEntityType);
    if (relatedEntityId) {
      form.setValue("relatedId", relatedEntityId);
    }
  }, [relatedEntityType, relatedEntityId, form]);

  // Handle form submission
  const createTask = useMutation({
    mutationFn: async (data: InsertTask) => {
      console.log("Submitting task data:", data);
      const res = await apiRequest("POST", "/api/tasks", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create task");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      if (leadId) {
        queryClient.invalidateQueries({ queryKey: [`/api/leads/${leadId}/tasks`] });
        navigate(`/leads/${leadId}`); // Return to lead details page
      } else {
        navigate("/tasks"); // Return to tasks list
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

  const handleSubmit = async (data: TaskFormValues) => {
    console.log("Task form - submitting data:", data);
    
    // Extra validation
    if (!data.title) {
      console.error("Task form - Title is required");
      toast({
        title: "Validation Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.relatedId) {
      console.error("Task form - Lead selection is required");
      toast({
        title: "Validation Error",
        description: "Please select a lead for this task",
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
      console.log("Task form - current user:", user);

      // Create the payload with all required fields
      const payload = {
        ...data,
        relatedTo: data.relatedTo || "lead",
        createdBy: user.id,
        // Make sure dueDate is a Date object, not a string
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined
      };
      
      console.log("Task form - final payload:", payload);
      
      // Direct API call instead of mutation
      try {
        const res = await apiRequest("POST", "/api/tasks", payload);
        const responseData = await res.json();
        
        if (res.ok) {
          toast({
            title: "Success",
            description: "Task created successfully",
          });
          
          queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
          
          // Invalidate and navigate based on which entity we're working with
          if (leadId) {
            queryClient.invalidateQueries({ queryKey: [`/api/leads/${leadId}/tasks`] });
            navigate(`/leads/${leadId}`); // Return to lead details page
          } else if (opportunityId) {
            queryClient.invalidateQueries({ queryKey: [`/api/opportunities/${opportunityId}/tasks`] });
            navigate(`/opportunities/${opportunityId}`); // Return to opportunity details page
          } else {
            navigate("/tasks"); // Return to tasks list
          }
        } else {
          throw new Error(responseData.message || "API error response");
        }
      } catch (apiError) {
        throw apiError;
      }
    } catch (error) {
      console.error("Task form - submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit task: " + (error as Error).message,
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
                navigate("/tasks");
              }
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Create New Task</h1>
        </div>

        <div className="bg-card rounded-lg shadow p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
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
                                <span>Pick a date</span>
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
                          This task will be associated with the selected opportunity
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
                        <FormLabel>Lead *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(parseInt(value));
                            // Set relatedTo to 'lead' when a lead is selected
                            form.setValue("relatedTo", "lead");
                            console.log("Task form - selected lead ID:", value);
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
                          Tasks must be associated with a lead for proper tracking
                        </p>
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter task description" 
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
                      navigate("/tasks");
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
                  Create Task
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
}