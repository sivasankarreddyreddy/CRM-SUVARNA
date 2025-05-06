import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2 } from "lucide-react";

interface ModuleDeleteDialogProps {
  moduleId: number;
  moduleName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ModuleDeleteDialog({ 
  moduleId, 
  moduleName, 
  isOpen, 
  onClose 
}: ModuleDeleteDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Delete module mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/modules/${moduleId}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      toast({
        title: "Module Deleted",
        description: `${moduleName} has been deleted successfully.`,
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete module: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" /> Delete Module
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the module from the system.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 mb-4">
          <p>
            Are you sure you want to delete <span className="font-semibold">{moduleName}</span>?
          </p>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-amber-800">
              <strong>Warning:</strong> Deleting this module may affect associated products and quotations.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Module
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}