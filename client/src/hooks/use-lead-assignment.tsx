import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AssignLeadParams {
  leadId: number;
  assignedTo: number | null;
  assignmentNotes?: string;
}

export function useLeadAssignment() {
  const { toast } = useToast();
  
  const assignLeadMutation = useMutation({
    mutationFn: async ({ leadId, assignedTo, assignmentNotes }: AssignLeadParams) => {
      const res = await apiRequest('PATCH', `/api/leads/${leadId}/assign`, {
        assignedTo,
        assignmentNotes
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to assign lead');
      }
      
      return res.json();
    },
    onSuccess: () => {
      // Invalidate leads cache to refresh the leads list
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      
      toast({
        title: "Lead assigned successfully",
        description: "The lead has been assigned to the selected user.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to assign lead",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const bulkAssignLeadsMutation = useMutation({
    mutationFn: async ({ leadIds, assignedTo, notes }: { leadIds: number[], assignedTo: number, notes?: string }) => {
      const res = await apiRequest('POST', `/api/leads/bulk-assign`, {
        leadIds,
        assignedTo,
        notes
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to assign leads');
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate leads cache to refresh the leads list
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      
      const successCount = data.results.filter((r: { success: boolean }) => r.success).length;
      const failCount = data.results.length - successCount;
      
      toast({
        title: "Leads assigned",
        description: `Successfully assigned ${successCount} leads${failCount > 0 ? `. Failed to assign ${failCount} leads.` : '.'}`,
        variant: failCount > 0 ? "destructive" : "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to assign leads",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  return {
    assignLeadMutation,
    bulkAssignLeadsMutation
  };
}