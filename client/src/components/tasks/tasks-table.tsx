import React, { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckSquare, Clock, Edit, Eye, MoreHorizontal, Trash } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

interface TasksTableProps {
  tasks: any[];
  onUpdate: () => void;
}

export function TasksTable({ tasks, onUpdate }: TasksTableProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  
  const canEdit = user?.role === 'admin' || user?.role === 'sales_manager' || true; // Allow all users to manage tasks
  
  // Delete task mutation
  const deleteTask = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/tasks/${id}`);
      if (!res.ok) {
        throw new Error("Failed to delete task");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task deleted",
        description: "The task has been removed successfully",
      });
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete task: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });
  
  // Mark as complete mutation
  const completeTask = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, {
        status: "Completed",
      });
      if (!res.ok) {
        throw new Error("Failed to update task status");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task completed",
        description: "The task has been marked as completed",
      });
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });
  
  // Mark as in progress mutation
  const startTask = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, {
        status: "In Progress",
      });
      if (!res.ok) {
        throw new Error("Failed to update task status");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task started",
        description: "The task has been marked as in progress",
      });
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  // Handle status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'in progress':
        return 'bg-blue-500';
      case 'not started':
        return 'bg-gray-500';
      case 'deferred':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Handle priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center">
        <h3 className="font-medium">No tasks found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or create a new task.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Related To</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Modified Date</TableHead>
              <TableHead>Modified By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  {task.leadName ? 
                    `Lead: ${task.leadName}` : 
                    task.opportunityName ? 
                      `Opportunity: ${task.opportunityName}` : 
                      "—"}
                </TableCell>
                <TableCell>
                  {task.dueDate 
                    ? format(new Date(task.dueDate), 'dd MMM yyyy')
                    : 'Not set'}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>{task.assignedToName || "Unassigned"}</TableCell>
                <TableCell>
                  {task.modifiedAt 
                    ? format(new Date(task.modifiedAt), 'dd MMM yyyy HH:mm')
                    : 'Not set'}
                </TableCell>
                <TableCell>{task.modifiedByName || "—"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigate(`/tasks/${task.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {canEdit && (
                        <>
                          <DropdownMenuItem onClick={() => navigate(`/tasks/edit/${task.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Task
                          </DropdownMenuItem>
                          {task.status === 'Not Started' && (
                            <DropdownMenuItem onClick={() => startTask.mutate(task.id)}>
                              <Clock className="mr-2 h-4 w-4" />
                              Mark as In Progress
                            </DropdownMenuItem>
                          )}
                          {(task.status === 'Not Started' || task.status === 'In Progress') && (
                            <DropdownMenuItem onClick={() => completeTask.mutate(task.id)}>
                              <CheckSquare className="mr-2 h-4 w-4" />
                              Mark as Completed
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setTaskToDelete(task.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Task
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (taskToDelete) {
                  deleteTask.mutate(taskToDelete);
                  setTaskToDelete(null);
                }
              }}
              className="bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}