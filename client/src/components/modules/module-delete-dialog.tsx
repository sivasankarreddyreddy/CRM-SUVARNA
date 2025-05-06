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
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiRequest } from "@/lib/queryClient";

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
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const deleteModuleMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/modules/${moduleId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Module deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete module: ${error.message}`,
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  });
  
  const handleDelete = () => {
    setIsDeleting(true);
    deleteModuleMutation.mutate();
  };
  
  const handleClose = () => {
    setIsDeleting(false);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this module?</AlertDialogTitle>
          <AlertDialogDescription>
            <p>
              You are about to delete the module <span className="font-medium text-primary-600">{moduleName}</span>.
            </p>
            <p className="mt-2">
              This action cannot be undone. This will permanently delete the module and 
              remove associated data.
            </p>
            <p className="mt-2 text-red-500">
              Note: Products that include this module will have this module removed from their configuration.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <LoadingSpinner className="mr-2" size="sm" />
                Deleting...
              </>
            ) : (
              "Delete Module"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}