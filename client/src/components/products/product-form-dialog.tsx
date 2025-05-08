import { useState, useEffect } from "react";
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

  // Prepare form data based on the mode
  const [formData, setFormData] = useState<any>(null);
  
  // Update formData whenever initialData changes
  useEffect(() => {
    if (mode === "duplicate" && initialData) {
      setFormData({
        ...initialData,
        name: `${initialData.name} (Copy)`,
        id: undefined
      });
    } else {
      setFormData(initialData);
    }
  }, [initialData, mode]);

  // Create or update product mutation
  const productMutation = useMutation({
    mutationFn: async (data: any) => {
      const { modules, ...productData } = data;
      
      if (mode === "edit") {
        // Update existing product
        const response = await apiRequest("PATCH", `/api/products/${initialData.id}`, productData);
        const updatedProduct = await response.json();
        
        // Handle module associations if present
        if (modules && modules.length > 0) {
          // First, remove existing module associations
          await apiRequest("DELETE", `/api/products/${initialData.id}/modules`);
          
          // Then add new module associations
          for (const moduleAssoc of modules) {
            // Ensure moduleId is passed correctly and add createdBy field
            await apiRequest("POST", `/api/products/${initialData.id}/modules`, {
              moduleId: parseInt(moduleAssoc.moduleId) || moduleAssoc.id,
              createdBy: initialData?.createdBy || (window as any)?.currentUser?.id || 33 // Use admin user ID as fallback
            });
          }
        }
        
        return updatedProduct;
      } else {
        // Create new product
        const response = await apiRequest("POST", "/api/products", productData);
        const newProduct = await response.json();
        
        // Handle module associations if present
        if (modules && modules.length > 0) {
          for (const moduleAssoc of modules) {
            // Ensure moduleId is passed correctly and add createdBy field
            await apiRequest("POST", `/api/products/${newProduct.id}/modules`, {
              moduleId: parseInt(moduleAssoc.moduleId) || moduleAssoc.id,
              createdBy: newProduct.createdBy || (window as any)?.currentUser?.id || 33 // Use admin user ID as fallback
            });
          }
        }
        
        return newProduct;
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
      // Keep price and tax as strings, but ensure they're valid
      price: data.price ? data.price.toString() : "0",
      tax: data.tax ? data.tax.toString() : "0",
      vendorId: parseInt(data.vendorId) || null,
      // Use current user's ID for createdBy
      createdBy: initialData?.createdBy || (window as any)?.currentUser?.id || 33 // Use admin user ID as fallback
    };

    console.log("Submitting product data:", formattedData);
    productMutation.mutate(formattedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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