import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Calendar as CalendarIcon } from "lucide-react";
import { insertActivitySchema, InsertActivity, Activity } from "@shared/schema";

// Extend the activity schema with date validation and require lead selection
const activityFormSchema = insertActivitySchema.extend({
  completedAt: z.date().optional(),
  relatedId: z.number({
    required_error: "Lead selection is required",
    invalid_type_error: "Please select a valid lead",
  }),
}).transform((data) => {
  // Convert date object to ISO string if exists
  if (data.completedAt) {
    return {
      ...data,
      completedAt: data.completedAt.toISOString(),
    };
  }
  return data;
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

// Props for the form
interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Activity;
  leadId?: number;
  relatedTo?: string;
}

export function ActivityForm({ open, onOpenChange, initialData, leadId, relatedTo = "lead" }: ActivityFormProps) {
  const { toast } = useToast();

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

  // Fetch all leads for the dropdown
  const { data: leads } = useQuery({
    queryKey: ['/api/leads'],
  });

  // Form setup
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      type: initialData?.type || "note",
      relatedTo: relatedTo || initialData?.relatedTo || "lead",
      relatedId: leadId || initialData?.relatedId || undefined,
      completedAt: initialData?.completedAt ? new Date(initialData.completedAt) : new Date(),
    },
  });

  // Update form when leadId changes or when initialData changes
  useEffect(() => {
    console.log("Activity form - leadId:", leadId, "initialData:", initialData);
    
    // Reset form with initial values on mount or when initialData changes
    form.reset({
      title: initialData?.title || "",
      description: initialData?.description || "",
      type: initialData?.type || "note",
      relatedTo: relatedTo || initialData?.relatedTo || "lead",
      relatedId: leadId || initialData?.relatedId || undefined,
      completedAt: initialData?.completedAt ? new Date(initialData.completedAt) : new Date(),
    });

    // Specifically set the lead ID if it's provided externally
    if (leadId) {
      form.setValue("relatedTo", "lead");
      form.setValue("relatedId", leadId);
      
      // Also fetch and populate lead data if needed
      if (leads) {
        const selectedLead = leads.find((lead: any) => lead.id === leadId);
        if (selectedLead) {
          console.log("Auto-selected lead for activity:", selectedLead);
        }
      }
    }
  }, [leadId, initialData, form, leads, relatedTo]);

  // Handle form submission
  const createActivity = useMutation({
    mutationFn: async (data: InsertActivity) => {
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
      }
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });

  const updateActivity = useMutation({
    mutationFn: async (data: Partial<Activity> & { id: number }) => {
      const { id, ...rest } = data;
      const res = await apiRequest("PATCH", `/api/activities/${id}`, rest);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update activity");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Activity updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      if (initialData?.relatedId) {
        queryClient.invalidateQueries({ queryKey: [`/api/${initialData.relatedTo}s/${initialData.relatedId}/activities`] });
      }
      onOpenChange(false);
      form.reset();
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
    
    try {
      // Get the current user from the API to set as createdBy
      const userRes = await apiRequest("GET", "/api/user");
      if (!userRes.ok) {
        throw new Error("Failed to get current user");
      }
      const user = await userRes.json();
      console.log("Activity form - current user:", user);

      if (initialData?.id) {
        console.log("Activity form - updating existing activity");
        updateActivity.mutate({ id: initialData.id, ...data, createdBy: initialData.createdBy });
      } else {
        console.log("Activity form - creating new activity");
        createActivity.mutate({ ...data, createdBy: user.id });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? "Edit Activity" : "Log New Activity"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    }}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leads?.map((lead: any) => (
                        <SelectItem key={lead.id} value={lead.id.toString()}>
                          {lead.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-1">
                    Activities must be associated with a lead for proper tracking
                  </p>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter activity details" 
                      {...field} 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createActivity.isPending || updateActivity.isPending}>
                {initialData?.id ? "Update Activity" : "Save Activity"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ActivityForm;