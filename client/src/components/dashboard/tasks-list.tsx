import React from "react";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Task {
  id: number;
  title: string;
  dueTime?: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
}

interface TasksListProps {
  tasks: Task[];
  onToggleTask: (id: number, completed: boolean) => void;
  onAddTask?: () => void;
  onViewAll?: () => void;
  isLoading?: boolean;
}

export function TasksList({ tasks, onToggleTask, onAddTask, onViewAll, isLoading }: TasksListProps) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-lg font-semibold text-slate-800">Today's Tasks</CardTitle>
          <Button variant="ghost" size="icon" onClick={onAddTask}>
            <Plus className="h-5 w-5 text-primary-600" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-3">
          {isLoading ? (
            // Loading state
            Array(4).fill(0).map((_, index) => (
              <div key={`skeleton-${index}`} className="flex items-start p-3">
                <Skeleton className="h-4 w-4 rounded mt-1" />
                <div className="ml-3 flex-1">
                  <Skeleton className="h-5 w-4/5 mb-1" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))
          ) : tasks.length > 0 ? (
            // Data state
            tasks.map((task) => (
              <div key={task.id} className="flex items-start p-3 rounded-md hover:bg-slate-50">
                <Checkbox 
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={(checked) => onToggleTask(task.id, checked as boolean)}
                  className="h-4 w-4 mt-1"
                />
                <div className="ml-3 flex-1">
                  <label 
                    htmlFor={`task-${task.id}`}
                    className={`text-sm font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}
                  >
                    {task.title}
                  </label>
                  {task.dueTime && (
                    <p className="text-xs text-slate-500 mt-1">{task.dueTime}</p>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Badge variant={task.priority}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</Badge>
                </div>
              </div>
            ))
          ) : (
            // Empty state
            <div className="py-6 text-center text-slate-500">
              No tasks scheduled for today.
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t border-slate-200 p-4">
        <Button variant="link" className="text-primary-600 p-0" onClick={onViewAll}>
          View all tasks
        </Button>
      </CardFooter>
    </Card>
  );
}
