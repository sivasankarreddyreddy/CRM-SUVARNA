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
import { insertTaskSchema, InsertTask, Task } from "@shared/schema";

// Extend the task schema with date validation and require lead selection
const taskFormSchema = insertTaskSchema.extend({
  dueDate: z.date().optional(),
  relatedId: z.number({
    required_error: "Lead selection is required",
    invalid_type_error: "Please select a valid lead",
  }),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

// Props for the form
interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Task;
  leadId?: number;
  relatedTo?: string;
}

export function TaskForm({ open, onOpenChange, initialData, leadId, relatedTo = "lead" }: TaskFormProps) {
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
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      priority: initialData?.priority || "medium",
      status: initialData?.status || "pending",
      relatedTo: relatedTo || initialData?.relatedTo || "lead",
      relatedId: leadId || initialData?.relatedId || undefined,
      assignedTo: initialData?.assignedTo || undefined,
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : undefined,
    },
  });

  // Update form when leadId changes or when initialData changes
  useEffect(() => {
    console.log("Task form - leadId:", leadId, "initialData:", initialData);

    // Reset form with initial values on mount or when initialData changes
    form.reset({
      title: initialData?.title || "",
      description: initialData?.description || "",
      priority: initialData?.priority || "medium",
      status: initialData?.status || "pending",
      relatedTo: initialData?.relatedTo || "lead",
      relatedId: leadId || initialData?.relatedId || undefined,
      assignedTo: initialData?.assignedTo || undefined,
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : undefined,
    });

    // Specifically set the lead ID if it's provided externally
    if (leadId) {
      form.setValue("relatedTo", "lead");
      form.setValue("relatedId", leadId);
      
      // Also fetch and populate lead data if needed
      if (leads) {
        const selectedLead = leads.find((lead: any) => lead.id === leadId);
        if (selectedLead) {
          console.log("Auto-selected lead:", selectedLead);
        }
      }
    }
  }, [leadId, initialData, form, leads]);

  // Handle form submission
  const createTask = useMutation({
    mutationFn: async (data: InsertTask) => {
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

  const updateTask = useMutation({
    mutationFn: async (data: Partial<Task> & { id: number }) => {
      const { id, ...rest } = data;
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, rest);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update task");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      if (initialData?.relatedId) {
        queryClient.invalidateQueries({ queryKey: [`/api/${initialData.relatedTo}s/${initialData.relatedId}/tasks`] });
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
        createdBy: initialData?.id ? initialData.createdBy : user.id
      };
      
      console.log("Task form - final payload:", payload);

      if (initialData?.id) {
        console.log("Task form - updating existing task");
        updateTask.mutate({ id: initialData.id, ...payload });
      } else {
        console.log("Task form - creating new task");
        createTask.mutate(payload);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="task-form-description">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? "Edit Task" : "Create New Task"}</DialogTitle>
          <p id="task-form-description" className="text-sm text-muted-foreground">
            Fill in the details below to {initialData?.id ? "update the" : "create a new"} task.
          </p>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                      Tasks must be associated with a lead for proper tracking
                    </p>
                  </FormItem>
                )}
              />
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
              <Button type="submit" disabled={createTask.isPending || updateTask.isPending}>
                {initialData?.id ? "Update Task" : "Create Task"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default TaskForm;