import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsers } from "@/hooks/use-users";
import { useLeadAssignment } from "@/hooks/use-lead-assignment";

const assignmentFormSchema = z.object({
  assignedTo: z.string().nullable().transform(val => val === "" ? null : Number(val)),
  assignmentNotes: z.string().max(500, { message: "Notes cannot exceed 500 characters" }).optional(),
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
  const { assignLead, isAssigning, bulkAssignLeads, isBulkAssigning } = useLeadAssignment();

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      assignedTo: currentAssignee?.toString() || "",
      assignmentNotes: "",
    },
  });

  const handleSubmit = async (values: AssignmentFormValues) => {
    await assignLead({
      leadId,
      assignedTo: values.assignedTo,
      assignmentNotes: values.assignmentNotes,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Lead</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Assigning <span className="font-medium text-foreground">{leadName}</span> to a new owner
            </div>
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <Select
                    disabled={isLoadingUsers || isAssigning}
                    onValueChange={field.onChange}
                    value={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.fullName} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignmentNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any notes about this assignment" 
                      className="resize-none" 
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isAssigning}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAssigning}>
                {isAssigning ? "Assigning..." : "Assign Lead"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}