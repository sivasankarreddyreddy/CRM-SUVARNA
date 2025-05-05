import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Calendar as CalendarIcon, Clock } from "lucide-react";

const reminderSchema = z.object({
  taskId: z.number(),
  reminderDate: z.date({
    required_error: "Reminder date is required",
  }),
  reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Time should be in HH:MM format",
  }),
  reminderType: z.enum(["email", "notification", "both"], {
    required_error: "Reminder type is required",
  }),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

interface ReminderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number;
  taskTitle: string;
}

export function ReminderForm({ open, onOpenChange, taskId, taskTitle }: ReminderFormProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Get current time in HH:MM format for default value
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const defaultTime = `${hours}:${minutes}`;

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      taskId: taskId,
      reminderDate: undefined,
      reminderTime: defaultTime,
      reminderType: "notification",
    },
  });

  // Set taskId when it changes
  React.useEffect(() => {
    form.setValue("taskId", taskId);
  }, [taskId, form]);

  // Create reminder mutation
  const createReminderMutation = useMutation({
    mutationFn: async (data: ReminderFormValues) => {
      // Combine date and time for the API
      const reminderDate = new Date(data.reminderDate);
      const [hours, minutes] = data.reminderTime.split(':').map(Number);
      reminderDate.setHours(hours, minutes, 0, 0);

      const payload = {
        taskId: data.taskId,
        reminderDateTime: reminderDate.toISOString(),
        reminderType: data.reminderType
      };

      console.log("Creating reminder with payload:", payload);
      const res = await apiRequest("POST", "/api/reminders", payload);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create reminder");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reminder set successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set reminder",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: ReminderFormValues) => {
    try {
      // Validate that the date is not in the past
      const selectedDate = new Date(data.reminderDate);
      const [hours, minutes] = data.reminderTime.split(':').map(Number);
      selectedDate.setHours(hours, minutes, 0, 0);

      if (selectedDate < new Date()) {
        toast({
          title: "Invalid Date",
          description: "Cannot set a reminder for a past date and time",
          variant: "destructive",
        });
        return;
      }

      createReminderMutation.mutate(data);
    } catch (error) {
      console.error("Error setting reminder:", error);
      toast({
        title: "Error",
        description: "Failed to set reminder: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Reminder</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Setting reminder for: <span className="font-medium text-foreground">{taskTitle}</span>
            </div>

            <FormField
              control={form.control}
              name="reminderDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Reminder Date *</FormLabel>
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
                        onSelect={(date) => {
                          field.onChange(date);
                          setSelectedDate(date);
                        }}
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
              name="reminderTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reminder Time *</FormLabel>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input 
                        type="time" 
                        className="pl-10" 
                        {...field} 
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reminderType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notification Type *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select notification type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="notification">In-app Notification</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createReminderMutation.isPending}>
                {createReminderMutation.isPending ? "Setting..." : "Set Reminder"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ReminderForm;