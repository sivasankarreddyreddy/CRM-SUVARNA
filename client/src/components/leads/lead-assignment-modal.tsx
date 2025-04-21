import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUsers } from "@/hooks/use-users";
import { useLeadAssignment } from "@/hooks/use-lead-assignment";
import { Loader2 } from "lucide-react";

const assignmentFormSchema = z.object({
  assignedTo: z.string().min(1, "Please select a user"),
  notes: z.string().optional(),
});

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

interface LeadAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: number;
  leadName: string;
  currentAssignee?: number | null;
}

export function LeadAssignmentModal({ 
  open, 
  onOpenChange, 
  leadId, 
  leadName,
  currentAssignee
}: LeadAssignmentModalProps) {
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { assignLeadMutation } = useLeadAssignment();
  
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      assignedTo: currentAssignee?.toString() || "",
      notes: "",
    },
  });

  const handleSubmit = async (values: AssignmentFormValues) => {
    await assignLeadMutation.mutateAsync({
      leadId,
      assignedTo: parseInt(values.assignedTo),
      assignmentNotes: values.notes,
    });
    
    onOpenChange(false);
  };

  const currentAssigneeName = currentAssignee 
    ? users?.find(u => u.id === currentAssignee)?.fullName 
    : "Unassigned";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Lead</DialogTitle>
          <DialogDescription>
            Assign "{leadName}" to a sales representative
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Currently assigned to: {isLoadingUsers ? (
                <span className="inline-flex items-center">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Loading...
                </span>
              ) : currentAssigneeName}
            </div>
            
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user">
                          {isLoadingUsers ? (
                            <div className="flex items-center">
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Loading users...
                            </div>
                          ) : ""}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users
                        .filter(user => user.role === 'sales_executive' || user.role === 'sales_manager')
                        .map(user => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.fullName} ({user.role === 'sales_executive' ? 'Sales Exec' : 'Sales Manager'})
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any notes about this assignment (optional)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={assignLeadMutation.isPending}
              >
                {assignLeadMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : "Assign Lead"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}