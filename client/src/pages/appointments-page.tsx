import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Appointment, InsertAppointment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, Pencil, Trash } from "lucide-react";

// Extended schema for the form with validation
const appointmentFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().nullable().optional(),
  startTime: z.date({ required_error: "Start time is required" }),
  endTime: z.date({ required_error: "End time is required" }),
  location: z.string().nullable().optional(),
  attendeeType: z.string({ required_error: "Attendee type is required" }),
  attendeeId: z.number({ required_error: "Attendee ID is required" }),
  createdBy: z.number()
}).refine(data => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"]
});

type FormData = z.infer<typeof appointmentFormSchema>;

const AppointmentsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000), // Default 1 hour later
      location: "",
      attendeeType: "contact",
      attendeeId: 0,
      createdBy: user?.id || 0
    }
  });
  
  // Fetch appointments
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    queryFn: async ({ queryKey }) => {
      const url = queryKey[0] as string;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      return response.json();
    }
  });
  
  // Create appointment mutation
  const createMutation = useMutation({
    mutationFn: async (appointment: InsertAppointment) => {
      const res = await apiRequest("POST", "/api/appointments", appointment);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create appointment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setOpenDialog(false);
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update appointment mutation
  const updateMutation = useMutation({
    mutationFn: async (appointment: Partial<Appointment> & { id: number }) => {
      const { id, ...data } = appointment;
      const res = await apiRequest("PATCH", `/api/appointments/${id}`, data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update appointment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setOpenDialog(false);
      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });
      form.reset();
      setEditingAppointment(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete appointment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/appointments/${id}`);
      if (!res.ok) {
        throw new Error("Failed to delete appointment");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data: FormData) => {
    if (editingAppointment) {
      updateMutation.mutate({ ...data, id: editingAppointment.id });
    } else {
      createMutation.mutate(data);
    }
  };
  
  // Open dialog to edit an appointment
  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    form.reset({
      title: appointment.title,
      description: appointment.description || "",
      startTime: new Date(appointment.startTime),
      endTime: new Date(appointment.endTime),
      location: appointment.location || "",
      attendeeType: appointment.attendeeType,
      attendeeId: appointment.attendeeId,
      createdBy: appointment.createdBy
    });
    setOpenDialog(true);
  };
  
  // Open dialog to create a new appointment
  const handleCreate = () => {
    setEditingAppointment(null);
    form.reset({
      title: "",
      description: "",
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000), // Default 1 hour later
      location: "",
      attendeeType: "contact",
      attendeeId: 0,
      createdBy: user?.id || 0
    });
    setOpenDialog(true);
  };
  
  // Handle appointment deletion
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      deleteMutation.mutate(id);
    }
  };
  
  // Filter appointments based on the selected tab
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.startTime);
    const now = new Date();
    
    if (activeTab === "upcoming") {
      return appointmentDate >= now;
    } else if (activeTab === "past") {
      return appointmentDate < now;
    } else if (activeTab === "day" && date) {
      return (
        appointmentDate.getDate() === date.getDate() &&
        appointmentDate.getMonth() === date.getMonth() &&
        appointmentDate.getFullYear() === date.getFullYear()
      );
    }
    return true;
  });
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> New Appointment
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="day">Day View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>
                    View and manage your upcoming appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center p-4">Loading appointments...</div>
                  ) : filteredAppointments.length === 0 ? (
                    <div className="text-center p-4">No upcoming appointments found</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Attendee</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAppointments.map(appointment => (
                          <TableRow key={appointment.id}>
                            <TableCell className="font-medium">{appointment.title}</TableCell>
                            <TableCell>
                              {format(new Date(appointment.startTime), "MMM d, yyyy h:mm a")} - 
                              {format(new Date(appointment.endTime), "h:mm a")}
                            </TableCell>
                            <TableCell>{appointment.location || "N/A"}</TableCell>
                            <TableCell>{`${appointment.attendeeType} (ID: ${appointment.attendeeId})`}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEdit(appointment)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDelete(appointment.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="past" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Past Appointments</CardTitle>
                  <CardDescription>
                    View your appointment history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center p-4">Loading appointments...</div>
                  ) : filteredAppointments.length === 0 ? (
                    <div className="text-center p-4">No past appointments found</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Attendee</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAppointments.map(appointment => (
                          <TableRow key={appointment.id}>
                            <TableCell className="font-medium">{appointment.title}</TableCell>
                            <TableCell>
                              {format(new Date(appointment.startTime), "MMM d, yyyy h:mm a")} - 
                              {format(new Date(appointment.endTime), "h:mm a")}
                            </TableCell>
                            <TableCell>{appointment.location || "N/A"}</TableCell>
                            <TableCell>{`${appointment.attendeeType} (ID: ${appointment.attendeeId})`}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEdit(appointment)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDelete(appointment.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="day" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Day View: {date ? format(date, "MMMM d, yyyy") : "Select a date"}</CardTitle>
                  <CardDescription>
                    View appointments for a specific day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center p-4">Loading appointments...</div>
                  ) : filteredAppointments.length === 0 ? (
                    <div className="text-center p-4">No appointments found for this day</div>
                  ) : (
                    <div className="space-y-4">
                      {filteredAppointments.map(appointment => (
                        <Card key={appointment.id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{appointment.title}</CardTitle>
                            <CardDescription>
                              {format(new Date(appointment.startTime), "h:mm a")} - 
                              {format(new Date(appointment.endTime), "h:mm a")}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            {appointment.description && <p className="text-sm mb-2">{appointment.description}</p>}
                            {appointment.location && <p className="text-sm text-muted-foreground">Location: {appointment.location}</p>}
                            <p className="text-sm text-muted-foreground">
                              Attendee: {appointment.attendeeType} (ID: {appointment.attendeeId})
                            </p>
                          </CardContent>
                          <CardFooter className="flex justify-end pt-0">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEdit(appointment)}
                            >
                              <Pencil className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(appointment.id)}
                            >
                              <Trash className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>
                Select a date to view appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="border rounded-md p-3"
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Appointment Create/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingAppointment ? "Edit Appointment" : "Create New Appointment"}</DialogTitle>
            <DialogDescription>
              {editingAppointment 
                ? "Make changes to your appointment here."
                : "Fill in the details for your new appointment."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter appointment title"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter appointment details"
                  {...form.register("description")}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.getValues("startTime") && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.getValues("startTime") ? (
                          format(form.getValues("startTime"), "PPP HH:mm")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.getValues("startTime")}
                        onSelect={(date) => date && form.setValue("startTime", date)}
                        initialFocus
                      />
                      <div className="p-3 border-t border-border">
                        <Input
                          type="time"
                          value={format(form.getValues("startTime") || new Date(), "HH:mm")}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(":");
                            const newDate = new Date(form.getValues("startTime") || new Date());
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            form.setValue("startTime", newDate);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.startTime && (
                    <p className="text-sm text-red-500">{form.formState.errors.startTime.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.getValues("endTime") && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.getValues("endTime") ? (
                          format(form.getValues("endTime"), "PPP HH:mm")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.getValues("endTime")}
                        onSelect={(date) => date && form.setValue("endTime", date)}
                        initialFocus
                      />
                      <div className="p-3 border-t border-border">
                        <Input
                          type="time"
                          value={format(form.getValues("endTime") || new Date(), "HH:mm")}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(":");
                            const newDate = new Date(form.getValues("endTime") || new Date());
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            form.setValue("endTime", newDate);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.endTime && (
                    <p className="text-sm text-red-500">{form.formState.errors.endTime.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  placeholder="Enter location"
                  {...form.register("location")}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="attendeeType">Attendee Type</Label>
                  <Select
                    value={form.getValues("attendeeType")}
                    onValueChange={(value) => form.setValue("attendeeType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contact">Contact</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="opportunity">Opportunity</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.attendeeType && (
                    <p className="text-sm text-red-500">{form.formState.errors.attendeeType.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="attendeeId">Attendee ID</Label>
                  <Input
                    id="attendeeId"
                    type="number"
                    placeholder="Enter ID"
                    {...form.register("attendeeId", {
                      valueAsNumber: true,
                    })}
                  />
                  {form.formState.errors.attendeeId && (
                    <p className="text-sm text-red-500">{form.formState.errors.attendeeId.message}</p>
                  )}
                </div>
              </div>
              
              <input
                type="hidden"
                {...form.register("createdBy", { valueAsNumber: true })}
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpenDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsPage;