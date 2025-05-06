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

interface VendorDeleteDialogProps {
  vendorId: number;
  vendorName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VendorDeleteDialog({ vendorId, vendorName, isOpen, onClose }: VendorDeleteDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(false);

  // Delete vendor mutation
  const deleteVendorMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/vendors/${vendorId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete vendor");
      }
      return true;
    },
    onMutate: () => {
      setIsConfirmDisabled(true);
    },
    onSuccess: () => {
      toast({
        title: "Vendor Deleted",
        description: `${vendorName} has been deleted successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
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
    deleteVendorMutation.mutate();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{vendorName}"? This action cannot be undone.
            <br />
            <br />
            <strong className="text-red-600">Warning:</strong> Deleting this vendor may affect associated products.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteVendorMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isConfirmDisabled}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteVendorMutation.isPending ? (
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