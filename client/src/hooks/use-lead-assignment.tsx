import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AssignLeadParams {
  leadId: number;
  assignedTo: number | null;
  assignmentNotes?: string;
}

interface BulkAssignLeadsParams {
  leadIds: number[];
  assignedTo: number | null;
  assignmentNotes?: string;
}

export function useLeadAssignment() {
  const { toast } = useToast();

  const assignLeadMutation = useMutation({
    mutationFn: async ({ leadId, assignedTo, assignmentNotes }: AssignLeadParams) => {
      return await apiRequest("POST", "/api/leads/assign", {
        leadId,
        assignedTo,
        notes: assignmentNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Lead assigned successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to assign lead: " + error.message,
        variant: "destructive",
      });
    },
  });

  const bulkAssignLeadsMutation = useMutation({
    mutationFn: async ({ leadIds, assignedTo, assignmentNotes }: BulkAssignLeadsParams) => {
      return await apiRequest("POST", "/api/leads/bulk-assign", {
        leadIds,
        assignedTo,
        notes: assignmentNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Leads assigned successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to bulk assign leads: " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    assignLead: assignLeadMutation.mutate,
    isAssigning: assignLeadMutation.isPending,
    bulkAssignLeads: bulkAssignLeadsMutation.mutate,
    isBulkAssigning: bulkAssignLeadsMutation.isPending,
  };
}