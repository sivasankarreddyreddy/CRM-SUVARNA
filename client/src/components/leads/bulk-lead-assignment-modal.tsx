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

const bulkAssignmentFormSchema = z.object({
  assignedTo: z.string().min(1, "Please select a user"),
  notes: z.string().optional(),
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
  selectedLeadIds,
}: BulkLeadAssignmentModalProps) {
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { bulkAssignLeadsMutation } = useLeadAssignment();
  
  const form = useForm<BulkAssignmentFormValues>({
    resolver: zodResolver(bulkAssignmentFormSchema),
    defaultValues: {
      assignedTo: "",
      notes: "",
    },
  });

  const handleSubmit = async (values: BulkAssignmentFormValues) => {
    await bulkAssignLeadsMutation.mutateAsync({
      leadIds: selectedLeadIds,
      assignedTo: parseInt(values.assignedTo),
      notes: values.notes,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Assign Leads</DialogTitle>
          <DialogDescription>
            Assign {selectedLeadIds.length} selected lead{selectedLeadIds.length !== 1 ? 's' : ''} to a sales representative
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                      placeholder="Add any notes about this bulk assignment (optional)" 
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
                disabled={bulkAssignLeadsMutation.isPending}
              >
                {bulkAssignLeadsMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : `Assign ${selectedLeadIds.length} Lead${selectedLeadIds.length !== 1 ? 's' : ''}`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}