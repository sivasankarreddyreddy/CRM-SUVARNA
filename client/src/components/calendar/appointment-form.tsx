import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Form schema for appointment
const appointmentSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.date({ required_error: "Start date is required" }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
    message: "Start time must be in 24-hour format (HH:MM)" 
  }),
  endDate: z.date({ required_error: "End date is required" }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
    message: "End time must be in 24-hour format (HH:MM)" 
  }),
  attendeeType: z.string().min(1, { message: "Attendee type is required" }),
  attendeeId: z.number().min(1, { message: "Attendee is required" }),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  appointmentId?: number; // Optional for editing existing appointments
}

export function AppointmentForm({ 
  isOpen, 
  onClose, 
  initialDate = new Date(), 
  appointmentId
}: AppointmentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAttendeeType, setSelectedAttendeeType] = useState<string>("contact");
  
  // Fetch existing appointment data if editing
  const { data: existingAppointment, isLoading: isLoadingAppointment } = useQuery({
    queryKey: ["/api/appointments", appointmentId],
    queryFn: async () => {
      if (!appointmentId) return null;
      const res = await apiRequest("GET", `/api/appointments/${appointmentId}`);
      if (!res.ok) throw new Error("Failed to fetch appointment");
      return await res.json();
    },
    enabled: !!appointmentId,
  });

  // Fetch contacts for the attendee dropdown
  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/contacts");
      if (!res.ok) throw new Error("Failed to fetch contacts");
      return await res.json();
    },
    enabled: selectedAttendeeType === "contact"
  });

  // Fetch leads for the attendee dropdown
  const { data: leads = [], isLoading: isLoadingLeads } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/leads");
      if (!res.ok) throw new Error("Failed to fetch leads");
      return await res.json();
    },
    enabled: selectedAttendeeType === "lead"
  });

  // Set up the form
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      startDate: initialDate,
      startTime: format(initialDate, "HH:mm"),
      endDate: initialDate,
      endTime: format(new Date(initialDate.getTime() + 60 * 60 * 1000), "HH:mm"), // Default 1 hour duration
      attendeeType: "contact",
      attendeeId: 0,
    },
  });

  // Update form values when editing an existing appointment
  useEffect(() => {
    if (existingAppointment) {
      const startDate = new Date(existingAppointment.startTime);
      const endDate = new Date(existingAppointment.endTime);
      
      form.reset({
        title: existingAppointment.title,
        description: existingAppointment.description || "",
        location: existingAppointment.location || "",
        startDate: startDate,
        startTime: format(startDate, "HH:mm"),
        endDate: endDate,
        endTime: format(endDate, "HH:mm"),
        attendeeType: existingAppointment.attendeeType,
        attendeeId: existingAppointment.attendeeId,
      });
      
      setSelectedAttendeeType(existingAppointment.attendeeType);
    }
  }, [existingAppointment, form]);

  // Handle form submission
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(
        appointmentId ? "PATCH" : "POST",
        appointmentId ? `/api/appointments/${appointmentId}` : "/api/appointments",
        data
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save appointment");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: appointmentId ? "Appointment updated" : "Appointment created",
        description: appointmentId 
          ? "Your appointment has been updated successfully." 
          : "Your appointment has been scheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Function to convert form data to the API format
  const formatAppointmentData = (values: AppointmentFormValues) => {
    const startTime = new Date(values.startDate);
    const [startHours, startMinutes] = values.startTime.split(":").map(Number);
    startTime.setHours(startHours, startMinutes, 0, 0);
    
    const endTime = new Date(values.endDate);
    const [endHours, endMinutes] = values.endTime.split(":").map(Number);
    endTime.setHours(endHours, endMinutes, 0, 0);
    
    return {
      title: values.title,
      description: values.description,
      location: values.location,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      attendeeType: values.attendeeType,
      attendeeId: values.attendeeId,
      // The server will handle adding the createdBy field
    };
  };
  
  const onSubmit = (values: AppointmentFormValues) => {
    createAppointmentMutation.mutate(formatAppointmentData(values));
  };

  // Handle attendee type change
  const handleAttendeeTypeChange = (value: string) => {
    setSelectedAttendeeType(value);
    form.setValue("attendeeType", value);
    form.setValue("attendeeId", 0); // Reset the attendee ID when changing type
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {appointmentId ? "Edit Appointment" : "Schedule New Appointment"}
          </DialogTitle>
          <DialogDescription>
            Fill in the details to {appointmentId ? "update your" : "schedule a new"} appointment.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Meeting with client" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the appointment"
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Office, virtual meeting, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Date and Time section */}
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
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
              
              {/* Start Time */}
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input type="time" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* End Date */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
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
              
              {/* End Time */}
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input type="time" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Attendee Section */}
            <div className="grid grid-cols-2 gap-4">
              {/* Attendee Type */}
              <FormField
                control={form.control}
                name="attendeeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attendee Type</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={(value) => handleAttendeeTypeChange(value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="contact">Contact</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Attendee Selector */}
              <FormField
                control={form.control}
                name="attendeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attendee</FormLabel>
                    <Select 
                      value={field.value ? field.value.toString() : ""} 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select attendee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedAttendeeType === "contact" ? (
                          isLoadingContacts ? (
                            <SelectItem value="0" disabled>Loading contacts...</SelectItem>
                          ) : contacts.length === 0 ? (
                            <SelectItem value="0" disabled>No contacts available</SelectItem>
                          ) : (
                            contacts.map((contact: any) => (
                              <SelectItem key={contact.id} value={contact.id.toString()}>
                                {contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`} - {contact.company?.name || contact.companyName || 'No Company'}
                              </SelectItem>
                            ))
                          )
                        ) : (
                          isLoadingLeads ? (
                            <SelectItem value="0" disabled>Loading leads...</SelectItem>
                          ) : leads.length === 0 ? (
                            <SelectItem value="0" disabled>No leads available</SelectItem>
                          ) : (
                            leads.map((lead: any) => (
                              <SelectItem key={lead.id} value={lead.id.toString()}>
                                {lead.name || `${lead.firstName || ''} ${lead.lastName || ''}`} - {lead.company?.name || lead.companyName || 'No Company'}
                              </SelectItem>
                            ))
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createAppointmentMutation.isPending}
              >
                {createAppointmentMutation.isPending ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  appointmentId ? "Update Appointment" : "Create Appointment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}