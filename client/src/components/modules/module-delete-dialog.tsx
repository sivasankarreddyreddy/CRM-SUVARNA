import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ModuleDeleteDialogProps {
  moduleId: number;
  moduleName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ModuleDeleteDialog({ moduleId, moduleName, isOpen, onClose }: ModuleDeleteDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(false);

  // Delete module mutation
  const deleteModuleMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/modules/${moduleId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete module");
      }
      return true;
    },
    onMutate: () => {
      setIsConfirmDisabled(true);
    },
    onSuccess: () => {
      toast({
        title: "Module Deleted",
        description: `${moduleName} has been deleted successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsConfirmDisabled(false);
    },
  });

  const handleDelete = () => {
    deleteModuleMutation.mutate();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Module</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{moduleName}"? This action cannot be undone.
            <br />
            <br />
            <strong className="text-red-600">Warning:</strong> Deleting this module may affect products that use it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteModuleMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isConfirmDisabled}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteModuleMutation.isPending ? (
              <>
                <LoadingSpinner className="mr-2" size="sm" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}