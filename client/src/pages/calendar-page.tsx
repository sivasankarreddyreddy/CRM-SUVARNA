import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Plus, Users, Edit, Trash, MoreHorizontal } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { AppointmentForm } from "@/components/calendar/appointment-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

// Define the appointment type based on our database schema
interface DbAppointment {
  id: number;
  title: string;
  description: string | null;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  location: string | null;
  attendeeType: string;
  attendeeId: number;
  createdBy: number;
  createdAt: string;
  attendeeName?: string; // May be added by the server for display purposes
}

// Define a simpler appointment interface for display purposes
interface DisplayAppointment {
  id: number;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  attendees: string;
  type: string;
  status: string;
  originalData: DbAppointment;
}

export default function CalendarPage() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"month" | "day" | "week">("month");
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null);
  
  // Fetch appointments data from the API
  const { data: dbAppointments = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/appointments"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/appointments");
        if (!res.ok) {
          throw new Error("Failed to fetch appointments");
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching appointments:", error);
        return [];
      }
    },
  });
  
  // Delete appointment mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/appointments/${id}`);
      if (!response.ok) {
        throw new Error("Failed to delete appointment");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Appointment deleted",
        description: "The appointment has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete appointment",
        variant: "destructive",
      });
    },
  });
  
  // Convert database appointments to display appointments
  const convertDbAppointmentsToDisplayFormat = (appointments: DbAppointment[]): DisplayAppointment[] => {
    return appointments.map(appointment => {
      const startTime = parseISO(appointment.startTime);
      const endTime = parseISO(appointment.endTime);
      
      return {
        id: appointment.id,
        title: appointment.title,
        description: appointment.description || "",
        date: startTime,
        startTime: format(startTime, "HH:mm"),
        endTime: format(endTime, "HH:mm"),
        location: appointment.location || "",
        // Display either contact or lead name if available
        attendees: appointment.attendeeName || `${appointment.attendeeType} #${appointment.attendeeId}`,
        // Map attendee type to a display category
        type: appointment.attendeeType === "lead" ? "lead_meeting" : "client_meeting",
        status: startTime > new Date() ? "scheduled" : "completed",
        originalData: appointment
      };
    });
  };
  
  // Process appointments for display
  const displayAppointments = convertDbAppointmentsToDisplayFormat(dbAppointments);
  
  // Handle opening the appointment form for creating or editing
  const handleOpenAppointmentForm = (appointmentId?: number) => {
    setSelectedAppointmentId(appointmentId);
    setIsAppointmentFormOpen(true);
  };
  
  // Handle closing the appointment form
  const handleCloseAppointmentForm = () => {
    setIsAppointmentFormOpen(false);
    setSelectedAppointmentId(undefined);
  };
  
  // Handle appointment deletion confirmation
  const handleDeleteConfirmation = (id: number) => {
    setAppointmentToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  // Execute appointment deletion
  const handleDeleteAppointment = () => {
    if (appointmentToDelete) {
      deleteAppointmentMutation.mutate(appointmentToDelete);
    }
  };

  // Filter appointments for the selected date (when in day view)
  const filteredAppointments = view === "day" && date 
    ? displayAppointments.filter((appointment: DisplayAppointment) => {
        const appointmentDate = new Date(appointment.date);
        return (
          appointmentDate.getDate() === date.getDate() &&
          appointmentDate.getMonth() === date.getMonth() &&
          appointmentDate.getFullYear() === date.getFullYear()
        );
      })
    : displayAppointments;

  // Get dates that have appointments (for highlighting in the calendar)
  const appointmentDates = displayAppointments.map((appointment: DisplayAppointment) => {
    const appointmentDate = new Date(appointment.date);
    return new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
  });

  // Helper function to get event badge color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "client_meeting":
        return "bg-blue-100 text-blue-800";
      case "lead_meeting":
        return "bg-green-100 text-green-800";
      case "call":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  // Handle adding a new appointment
  const handleAddAppointment = () => {
    handleOpenAppointmentForm();
  };

  const handleSelectDate = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      setView("day");
    }
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
            <p className="text-slate-500 mt-1">Schedule and manage your appointments</p>
          </div>
          <Button onClick={handleAddAppointment}>
            <Plus className="h-4 w-4 mr-2" /> 
            Add Appointment
          </Button>
        </div>
        
        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Select Date</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleSelectDate}
                      className="rounded-md border"
                      modifiers={{
                        hasEvent: (day) => 
                          appointmentDates.some((eventDate: Date) => 
                            eventDate.getDate() === day.getDate() &&
                            eventDate.getMonth() === day.getMonth() &&
                            eventDate.getFullYear() === day.getFullYear()
                          )
                      }}
                      modifiersStyles={{
                        hasEvent: { 
                          fontWeight: 'bold',
                          backgroundColor: '#f0f9ff',
                          borderRadius: '50%'
                        }
                      }}
                    />
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-around text-sm">
                        <Button
                          variant={view === "day" ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setView("day")}
                        >
                          Day
                        </Button>
                        <Button 
                          variant={view === "week" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setView("week")}
                        >
                          Week
                        </Button>
                        <Button 
                          variant={view === "month" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setView("month")}
                        >
                          Month
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>
                        {view === "day" && date
                          ? `Appointments for ${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                          : "Upcoming Appointments"
                        }
                      </CardTitle>
                    </div>
                    <CardDescription>
                      {isLoading
                        ? "Loading appointments..."
                        : view === "day"
                          ? `${filteredAppointments.length} appointments found`
                          : `Showing all appointments ${view === "week" ? "this week" : "this month"}`
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-pulse">Loading appointments...</div>
                      </div>
                    ) : filteredAppointments.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <CalendarIcon className="mx-auto h-12 w-12 text-slate-300" />
                        <p className="mt-2">No appointments found for the selected period</p>
                        <Button className="mt-4" variant="outline" onClick={handleAddAppointment}>
                          Schedule an Appointment
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredAppointments.map((appointment: DisplayAppointment) => (
                          <div key={appointment.id} className="border rounded-md p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                              <div className="font-medium text-slate-900">{appointment.title}</div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getEventTypeColor(appointment.type)}>
                                  {appointment.type.replace('_', ' ')}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleOpenAppointmentForm(appointment.id)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteConfirmation(appointment.id)}
                                      className="text-red-600"
                                    >
                                      <Trash className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            
                            <div className="text-sm text-slate-500 mb-2">{appointment.description}</div>
                            
                            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                              <div className="flex items-center">
                                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                                {format(appointment.date, 'PPP')} {appointment.startTime} - {appointment.endTime}
                              </div>
                              
                              <div className="flex items-center">
                                <Users className="h-3.5 w-3.5 mr-1" />
                                {appointment.attendees}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
                <CardDescription>
                  View all your scheduled appointments in list format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-pulse">Loading appointments...</div>
                    </div>
                  ) : displayAppointments.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <CalendarIcon className="mx-auto h-12 w-12 text-slate-300" />
                      <p className="mt-2">No appointments found</p>
                      <Button className="mt-4" variant="outline" onClick={handleAddAppointment}>
                        Schedule an Appointment
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="py-3 px-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="py-3 px-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                            <th className="py-3 px-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                            <th className="py-3 px-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                            <th className="py-3 px-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Attendees</th>
                            <th className="py-3 px-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="py-3 px-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayAppointments.map((appointment: DisplayAppointment) => (
                            <tr key={appointment.id} className="border-b hover:bg-slate-50">
                              <td className="py-3 px-2 text-sm text-slate-900">
                                {format(appointment.date, 'PPP')}
                              </td>
                              <td className="py-3 px-2 text-sm text-slate-500">
                                {appointment.startTime} - {appointment.endTime}
                              </td>
                              <td className="py-3 px-2 text-sm text-slate-900 font-medium">
                                {appointment.title}
                              </td>
                              <td className="py-3 px-2">
                                <Badge className={getEventTypeColor(appointment.type)}>
                                  {appointment.type.replace('_', ' ')}
                                </Badge>
                              </td>
                              <td className="py-3 px-2 text-sm text-slate-500">
                                {appointment.attendees}
                              </td>
                              <td className="py-3 px-2">
                                <Badge variant={appointment.status === "completed" ? "outline" : "default"}>
                                  {appointment.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="icon" className="h-8 w-8" 
                                    onClick={() => handleOpenAppointmentForm(appointment.id)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" 
                                    onClick={() => handleDeleteConfirmation(appointment.id)}>
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Appointment Form Dialog */}
      <AppointmentForm
        isOpen={isAppointmentFormOpen}
        onClose={handleCloseAppointmentForm}
        initialDate={date || new Date()}
        appointmentId={selectedAppointmentId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected appointment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAppointment}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteAppointmentMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}