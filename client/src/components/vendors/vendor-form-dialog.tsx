import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { VendorForm } from "./vendor-form";
import { apiRequest } from "@/lib/queryClient";

interface VendorFormDialogProps {
  initialData?: any;
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit" | "duplicate";
}

export function VendorFormDialog({ initialData, isOpen, onClose, mode }: VendorFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const dialogTitle = mode === "create" ? "Create Vendor" : mode === "edit" ? "Edit Vendor" : "Duplicate Vendor";
  const dialogDescription = mode === "create" 
    ? "Add a new vendor to your system" 
    : mode === "edit" 
    ? "Update vendor information" 
    : "Create a copy of this vendor";

  // Prepare form data for duplication (remove ID and change name)
  const [formData, setFormData] = useState(() => {
    if (mode === "duplicate" && initialData) {
      return {
        ...initialData,
        name: `${initialData.name} (Copy)`,
        id: undefined
      };
    }
    return initialData;
  });

  // Create or update vendor mutation
  const vendorMutation = useMutation({
    mutationFn: async (data: any) => {
      if (mode === "edit") {
        // Update existing vendor
        const response = await apiRequest("PATCH", `/api/vendors/${initialData.id}`, data);
        return await response.json();
      } else {
        // Create new vendor
        const response = await apiRequest("POST", "/api/vendors", data);
        return await response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: mode === "edit" ? "Vendor Updated" : "Vendor Created",
        description: mode === "edit" 
          ? "The vendor has been updated successfully."
          : mode === "duplicate"
          ? "The vendor has been duplicated successfully."
          : "The new vendor has been created successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to ${mode === "edit" ? "update" : "create"} vendor: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (data: any) => {
    // Format the data before submission
    const formattedData = {
      ...data,
      createdBy: initialData?.createdBy || 1 // Default to admin user if not provided
    };

    vendorMutation.mutate(formattedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <VendorForm 
          initialData={formData} 
          onSubmit={handleSubmit} 
          isSubmitting={vendorMutation.isPending} 
          isEditMode={mode === "edit"}
        />
      </DialogContent>
    </Dialog>
  );
}