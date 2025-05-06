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

interface VendorDeleteDialogProps {
  vendorId: number;
  vendorName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VendorDeleteDialog({ 
  vendorId,
  vendorName,
  isOpen, 
  onClose 
}: VendorDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const deleteVendorMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/vendors/${vendorId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Vendor deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete vendor: ${error.message}`,
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  });
  
  const handleDelete = () => {
    setIsDeleting(true);
    deleteVendorMutation.mutate();
  };
  
  const handleClose = () => {
    setIsDeleting(false);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this vendor?</AlertDialogTitle>
          <AlertDialogDescription>
            <p>
              You are about to delete the vendor <span className="font-medium text-primary-600">{vendorName}</span>.
            </p>
            <p className="mt-2">
              This action cannot be undone. This will permanently delete the vendor and 
              remove associated data.
            </p>
            <p className="mt-2 text-red-500">
              Note: Products from this vendor will remain in the system but will no longer be associated with any vendor.
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
              "Delete Vendor"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}