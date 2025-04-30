import React, { useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Plus, Users } from "lucide-react";

interface Appointment {
  id: number;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  attendees: string;
  status: string;
  type: string;
}

export default function CalendarPage() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"month" | "day" | "week">("month");
  
  // Fetch appointments data
  const { data: appointments = [], isLoading } = useQuery({
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

  // Generate dummy events if API doesn't return any
  const events: Appointment[] = appointments.length > 0 ? appointments as Appointment[] : [
    {
      id: 1,
      title: "Meeting with Apollo Hospital",
      description: "Discuss HIMS implementation strategy",
      date: new Date(),
      startTime: "10:00",
      endTime: "11:30",
      attendees: "Dr. Sharma, Dr. Patel",
      status: "scheduled",
      type: "client_meeting"
    },
    {
      id: 2,
      title: "Demo to Max Healthcare",
      description: "Product demo for diagnostics module",
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      startTime: "14:00",
      endTime: "15:30",
      attendees: "IT Director, CTO",
      status: "scheduled",
      type: "demo"
    },
    {
      id: 3,
      title: "Follow-up call with KIMS Hospital",
      description: "Discuss quotation details",
      date: new Date(new Date().setDate(new Date().getDate() - 1)),
      startTime: "11:00",
      endTime: "11:30",
      attendees: "Procurement Manager",
      status: "completed",
      type: "call"
    }
  ];

  // Filter events for the selected date (when in day view)
  const filteredEvents = view === "day" && date 
    ? events.filter((event: Appointment) => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getDate() === date.getDate() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        );
      })
    : events;

  // Get dates that have events (for highlighting in the calendar)
  const eventDates = events.map((event: Appointment) => {
    const eventDate = new Date(event.date);
    return new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  });

  // Helper function to get event badge color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "client_meeting":
        return "bg-blue-100 text-blue-800";
      case "demo":
        return "bg-green-100 text-green-800";
      case "call":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const handleAddAppointment = () => {
    toast({
      title: "Feature in development",
      description: "Appointment creation feature is coming soon!",
    });
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
                          eventDates.some((eventDate: Date) => 
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
                          ? `${filteredEvents.length} appointments found`
                          : `Showing all appointments ${view === "week" ? "this week" : "this month"}`
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-pulse">Loading appointments...</div>
                      </div>
                    ) : filteredEvents.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <CalendarIcon className="mx-auto h-12 w-12 text-slate-300" />
                        <p className="mt-2">No appointments found for the selected period</p>
                        <Button className="mt-4" variant="outline" onClick={handleAddAppointment}>
                          Schedule an Appointment
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredEvents.map((event: Appointment) => (
                          <div key={event.id} className="border rounded-md p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                              <div className="font-medium text-slate-900">{event.title}</div>
                              <Badge className={getEventTypeColor(event.type)}>
                                {event.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-slate-500 mb-2">{event.description}</div>
                            
                            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                              <div className="flex items-center">
                                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                                {new Date(event.date).toLocaleDateString()} {event.startTime} - {event.endTime}
                              </div>
                              
                              <div className="flex items-center">
                                <Users className="h-3.5 w-3.5 mr-1" />
                                {event.attendees}
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
                  ) : events.length === 0 ? (
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
                          </tr>
                        </thead>
                        <tbody>
                          {events.map((event: Appointment) => (
                            <tr key={event.id} className="border-b hover:bg-slate-50">
                              <td className="py-3 px-2 text-sm text-slate-900">
                                {new Date(event.date).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-2 text-sm text-slate-500">
                                {event.startTime} - {event.endTime}
                              </td>
                              <td className="py-3 px-2 text-sm text-slate-900 font-medium">
                                {event.title}
                              </td>
                              <td className="py-3 px-2">
                                <Badge className={getEventTypeColor(event.type)}>
                                  {event.type.replace('_', ' ')}
                                </Badge>
                              </td>
                              <td className="py-3 px-2 text-sm text-slate-500">
                                {event.attendees}
                              </td>
                              <td className="py-3 px-2">
                                <Badge variant={event.status === "completed" ? "outline" : "default"}>
                                  {event.status}
                                </Badge>
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
    </DashboardLayout>
  );
}