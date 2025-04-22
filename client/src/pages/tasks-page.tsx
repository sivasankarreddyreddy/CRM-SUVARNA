import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Search, Filter, Calendar, Clock, User, Link2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  // Toggle task status mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      return await apiRequest("PATCH", `/api/tasks/${id}`, { 
        status: completed ? "completed" : "pending" 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleToggleTask = (id: number, completed: boolean) => {
    toggleTaskMutation.mutate({ id, completed });
  };

  // Default tasks for initial rendering
  const defaultTasks = [
    { id: 1, title: "Call with Acme Corp about renewal", dueDate: "2023-07-20T10:30:00", priority: "high", status: "pending", assignedTo: "John Doe", relatedTo: "opportunity", relatedId: 1, relatedName: "Cloud Migration Service" },
    { id: 2, title: "Prepare proposal for TechGiant", dueDate: "2023-07-20T17:00:00", priority: "medium", status: "pending", assignedTo: "John Doe", relatedTo: "lead", relatedId: 2, relatedName: "TechGiant Inc" },
    { id: 3, title: "Follow up with DigiFuture leads", dueDate: "2023-07-20T14:00:00", priority: "low", status: "pending", assignedTo: "Sarah Johnson", relatedTo: "lead", relatedId: 4, relatedName: "DigiFuture Co" },
    { id: 4, title: "Update sales forecast for Q3", dueDate: "2023-07-20T17:00:00", priority: "medium", status: "completed", assignedTo: "John Doe", relatedTo: null, relatedId: null, relatedName: null },
    { id: 5, title: "Review contract with SecureData", dueDate: "2023-07-21T13:00:00", priority: "high", status: "pending", assignedTo: "Michael Brown", relatedTo: "opportunity", relatedId: 3, relatedName: "Security Assessment" },
  ];

  // Filter tasks based on search query
  const filteredTasks = tasks
    ? tasks.filter(
        (task: any) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.assignedTo && task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (task.relatedName && task.relatedName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : defaultTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.assignedTo && task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (task.relatedName && task.relatedName.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === today.getTime()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Tasks</h1>
            <p className="mt-1 text-sm text-slate-500">Manage and track your to-dos and follow-ups</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button variant="outline" className="inline-flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="inline-flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Calendar View
            </Button>
            <Button 
              className="inline-flex items-center"
              onClick={() => navigate("/tasks/new")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <Input
              type="text"
              placeholder="Search tasks by title, assignee, or related item..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Status</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Related To</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id} className={task.status === "completed" ? "bg-slate-50" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={task.status === "completed"}
                      onCheckedChange={(checked) => handleToggleTask(task.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className={`font-medium ${task.status === "completed" ? "text-slate-400 line-through" : ""}`}>
                    {task.title}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-slate-400 mr-1" />
                      <span>{formatDueDate(task.dueDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={task.priority}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-2">
                        <User className="h-3 w-3" />
                      </div>
                      {task.assignedTo}
                    </div>
                  </TableCell>
                  <TableCell>
                    {task.relatedTo ? (
                      <div className="flex items-center">
                        <Link2 className="h-4 w-4 text-slate-400 mr-1" />
                        <span className="text-primary-600 hover:underline cursor-pointer">
                          {task.relatedName}
                        </span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Set Reminder</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {task.status === "completed" ? (
                          <DropdownMenuItem onClick={() => handleToggleTask(task.id, false)}>
                            Mark as Pending
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleToggleTask(task.id, true)}>
                            Mark as Complete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
