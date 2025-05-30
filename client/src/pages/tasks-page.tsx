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
import { TaskForm } from "@/components/tasks/task-form";
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
import ReminderForm from "@/components/tasks/reminder-form";

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [reportingFilter, setReportingFilter] = useState<string>("all"); // "all", "assigned", "team"
  
  // Task form state
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  // Reminder form state
  const [isReminderFormOpen, setIsReminderFormOpen] = useState(false);
  const [taskForReminder, setTaskForReminder] = useState<any>(null);
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  // Fetch current user information
  const { data: currentUser } = useQuery({
    queryKey: ["/api/user"],
  });

  // Fetch tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  // Toggle task status mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, { 
        status: completed ? "completed" : "pending" 
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update task status");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task status updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/tasks/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete task");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task deleted successfully"
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete task: " + (error as Error).message,
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    },
  });

  const handleToggleTask = (id: number, completed: boolean) => {
    toggleTaskMutation.mutate({ id, completed });
  };
  
  const handleDeleteTask = (id: number) => {
    setTaskToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteTask = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete);
    }
  };
  
  const handleOpenReminderForm = (task: any) => {
    setTaskForReminder(task);
    setIsReminderFormOpen(true);
  };

  // Default tasks for initial rendering
  const defaultTasks = [
    { id: 1, title: "Call with Acme Corp about renewal", dueDate: "2023-07-20T10:30:00", priority: "high", status: "pending", assignedTo: "John Doe", relatedTo: "opportunity", relatedId: 1, relatedName: "Cloud Migration Service" },
    { id: 2, title: "Prepare proposal for TechGiant", dueDate: "2023-07-20T17:00:00", priority: "medium", status: "pending", assignedTo: "John Doe", relatedTo: "lead", relatedId: 2, relatedName: "TechGiant Inc" },
    { id: 3, title: "Follow up with DigiFuture leads", dueDate: "2023-07-20T14:00:00", priority: "low", status: "pending", assignedTo: "Sarah Johnson", relatedTo: "lead", relatedId: 4, relatedName: "DigiFuture Co" },
    { id: 4, title: "Update sales forecast for Q3", dueDate: "2023-07-20T17:00:00", priority: "medium", status: "completed", assignedTo: "John Doe", relatedTo: null, relatedId: null, relatedName: null },
    { id: 5, title: "Review contract with SecureData", dueDate: "2023-07-21T13:00:00", priority: "high", status: "pending", assignedTo: "Michael Brown", relatedTo: "opportunity", relatedId: 3, relatedName: "Security Assessment" },
  ];

  // Apply reporting filter first
  const reportingFilteredTasks = tasks
    ? tasks.filter((task: any) => {
        if (!currentUser) return true;
        
        if (reportingFilter === "all") {
          return true; // No filtering, show all tasks
        } else if (reportingFilter === "assigned") {
          // Show only tasks assigned to current user
          return task.assignedTo === currentUser.id;
        } else if (reportingFilter === "team") {
          // Show tasks for team members reporting to this user at any level in the hierarchy
          // This includes the user's own tasks, direct reports' tasks, and indirect reports' tasks
          return (
            task.assignedTo === currentUser.id || // Tasks assigned to current user
            // Check if the current user is in the reporting chain of the task's assignee
            (task.reportingChain && task.reportingChain.includes(currentUser.id))
          );
        }
        return true;
      })
    : defaultTasks;
    
  // Then filter by search query
  const filteredTasks = reportingFilteredTasks.filter(
    (task: any) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.assignedToName && task.assignedToName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.reportingToName && task.reportingToName.toLowerCase().includes(searchQuery.toLowerCase())) ||
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="inline-flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter by Team: {reportingFilter === "all" ? "All Tasks" : reportingFilter === "assigned" ? "My Tasks" : "My Team's Tasks"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => setReportingFilter("all")}>
                  All Tasks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setReportingFilter("assigned")}>
                  My Tasks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setReportingFilter("team")}>
                  My Team's Tasks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="outline" 
              className="inline-flex items-center"
              onClick={() => navigate("/tasks/calendar")}
            >
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
                <TableHead>Reporting To</TableHead>
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
                      {task.assignedToName || task.assignedTo || "Unassigned"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {task.reportingToName ? (
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                          <User className="h-3 w-3" />
                        </div>
                        {task.reportingToName}
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
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
                        <DropdownMenuItem onClick={() => {
                          setSelectedTask(task);
                          setIsTaskFormOpen(true);
                        }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenReminderForm(task)}>
                          Set Reminder
                        </DropdownMenuItem>
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
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600"
                        >
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Task Edit Form */}
      <TaskForm 
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        initialData={selectedTask}
        leadId={selectedTask?.relatedId}
        relatedTo={selectedTask?.relatedTo}
      />
      
      {/* Reminder Form */}
      {taskForReminder && (
        <ReminderForm
          open={isReminderFormOpen}
          onOpenChange={setIsReminderFormOpen}
          taskId={taskForReminder.id}
          taskTitle={taskForReminder.title}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task and all related data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteTask}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteTaskMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
