import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { List, CalendarIcon } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function TasksCalendarPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [view, setView] = useState<"month" | "day" | "week">("month");

  // Fetch tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "destructive";
      case "medium":
        return "medium"; // Using medium instead of warning
      case "low":
        return "low";
      default:
        return "secondary";
    }
  };

  // Process tasks to group by date for the calendar view
  const tasksByDate = React.useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return {};

    const grouped: Record<string, any[]> = {};
    
    tasks.forEach((task: any) => {
      if (!task.dueDate) return;
      
      const date = new Date(task.dueDate);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      
      grouped[dateStr].push(task);
    });
    
    return grouped;
  }, [tasks]);

  // Get tasks for the selected date
  const selectedDateTasks = React.useMemo(() => {
    if (!date || !tasks || !Array.isArray(tasks)) return [];
    
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter((task: any) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toISOString().split('T')[0] === dateStr;
    });
  }, [date, tasks]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Tasks Calendar</h1>
            <p className="mt-1 text-sm text-slate-500">View and manage your tasks in a calendar</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button 
              variant="outline" 
              className="inline-flex items-center"
              onClick={() => navigate("/tasks")}
            >
              <List className="mr-2 h-4 w-4" />
              List View
            </Button>
            <Button 
              className="inline-flex items-center"
              onClick={() => navigate("/tasks/new")}
            >
              <span className="mr-2">+</span>
              Add Task
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Calendar</CardTitle>
                  <Select value={view} onValueChange={(value: any) => setView(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="View" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  className="rounded-md border"
                  modifiers={{
                    hasTasks: (date) => {
                      const dateStr = date.toISOString().split('T')[0];
                      return !!tasksByDate[dateStr] && tasksByDate[dateStr].length > 0;
                    },
                  }}
                  modifiersStyles={{
                    hasTasks: {
                      fontWeight: "bold",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                    },
                  }}
                  components={{
                    DayContent: ({ date }) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const count = tasksByDate[dateStr]?.length || 0;
                      
                      return (
                        <div className="flex flex-col items-center justify-center">
                          <div>{date.getDate()}</div>
                          {count > 0 && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {count}
                            </Badge>
                          )}
                        </div>
                      );
                    },
                  }}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  {date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateTasks.length === 0 ? (
                  <div className="text-center py-6 text-slate-500">
                    No tasks scheduled for this date
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateTasks.map((task: any) => (
                      <div 
                        key={task.id} 
                        className="p-3 border rounded-md hover:bg-slate-50 cursor-pointer"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-slate-500 mt-1">
                              {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <Badge variant={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <div className="mt-2 text-sm text-slate-600">
                            {task.description.length > 100 
                              ? task.description.substring(0, 100) + '...' 
                              : task.description}
                          </div>
                        )}
                        {task.assignedTo && (
                          <div className="mt-2 text-xs text-slate-500">
                            Assigned to: {task.assignedTo}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}