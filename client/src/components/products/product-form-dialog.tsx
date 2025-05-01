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
import { ProductForm } from "./product-form";
import { apiRequest } from "@/lib/queryClient";

interface ProductFormDialogProps {
  initialData?: any;
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit" | "duplicate";
}

export function ProductFormDialog({ initialData, isOpen, onClose, mode }: ProductFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const dialogTitle = mode === "create" ? "Create Product" : mode === "edit" ? "Edit Product" : "Duplicate Product";
  const dialogDescription = mode === "create" 
    ? "Add a new product to your catalog" 
    : mode === "edit" 
    ? "Update product information" 
    : "Create a copy of this product";

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

  // Create or update product mutation
  const productMutation = useMutation({
    mutationFn: async (data: any) => {
      if (mode === "edit") {
        // Update existing product
        const response = await apiRequest("PATCH", `/api/products/${initialData.id}`, data);
        return await response.json();
      } else {
        // Create new product
        const response = await apiRequest("POST", "/api/products", data);
        return await response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: mode === "edit" ? "Product Updated" : "Product Created",
        description: mode === "edit" 
          ? "The product has been updated successfully."
          : mode === "duplicate"
          ? "The product has been duplicated successfully."
          : "The new product has been created successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to ${mode === "edit" ? "update" : "create"} product: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (data: any) => {
    // Format the data before submission
    const formattedData = {
      ...data,
      // Ensure prices are properly formatted as numeric values
      price: data.price,
      tax: data.tax || "0",
      createdBy: initialData?.createdBy || 1 // Default to admin user if not provided
    };

    productMutation.mutate(formattedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <ProductForm 
          initialData={formData} 
          onSubmit={handleSubmit} 
          isSubmitting={productMutation.isPending} 
          isEditMode={mode === "edit"}
        />
      </DialogContent>
    </Dialog>
  );
}