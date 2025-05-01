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

const bulkAssignmentFormSchema = z.object({
  assignedTo: z.union([
    z.string().transform(val => val === "null" ? null : parseInt(val)),
    z.number().nullable()
  ]).nullable(),
  assignmentNotes: z.string().max(500, { message: "Notes cannot exceed 500 characters" }).optional(),
});

type BulkAssignmentFormValues = z.infer<typeof bulkAssignmentFormSchema>;

interface BulkLeadAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLeadIds: number[];
}

export function BulkLeadAssignmentModal({ 
  open, 
  onOpenChange, 
  selectedLeadIds
}: BulkLeadAssignmentModalProps) {
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { bulkAssignLeads, isBulkAssigning } = useLeadAssignment();

  const form = useForm<BulkAssignmentFormValues>({
    resolver: zodResolver(bulkAssignmentFormSchema),
    defaultValues: {
      assignedTo: null,
      assignmentNotes: "",
    },
  });

  const handleSubmit = async (values: BulkAssignmentFormValues) => {
    await bulkAssignLeads({
      leadIds: selectedLeadIds,
      assignedTo: values.assignedTo,
      assignmentNotes: values.assignmentNotes,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Assign Leads</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Assigning <span className="font-medium text-foreground">{selectedLeadIds.length}</span> leads to a new owner
            </div>
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <Select
                    disabled={isLoadingUsers || isBulkAssigning}
                    onValueChange={field.onChange}
                    value={field.value?.toString() || "null"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Unassigned</SelectItem>
                      {users?.map((user: any) => (
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
                disabled={isBulkAssigning}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isBulkAssigning}>
                {isBulkAssigning ? "Assigning..." : `Assign ${selectedLeadIds.length} Leads`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}