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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Delete vendor mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/vendors/${vendorId}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      toast({
        title: "Vendor Deleted",
        description: `${vendorName} has been deleted successfully.`,
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete vendor: ${error.message}`,
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
            <AlertCircle className="h-5 w-5 mr-2" /> Delete Vendor
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the vendor from the system.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 mb-4">
          <p>
            Are you sure you want to delete <span className="font-semibold">{vendorName}</span>?
          </p>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-amber-800">
              <strong>Warning:</strong> Deleting this vendor may affect associated products. Products linked to this vendor will need to be reassigned.
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
            Delete Vendor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}