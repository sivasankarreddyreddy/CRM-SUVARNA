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
      try {
        console.log("Product mutation called with data:", data);
        const { modules, ...productData } = data;
        
        if (mode === "edit" && initialData) {
          console.log("Edit mode detected for product ID:", initialData.id);
          
          try {
            // Step 1: Update the product
            // Only send the necessary fields to avoid date conversion issues
            const simplifiedProductData = {
              name: productData.name || "",
              description: productData.description || "",
              sku: productData.sku || "",
              price: productData.price || "0",
              tax: productData.tax || "0",
              vendorId: productData.vendorId || null,
              isActive: productData.isActive === false ? false : true,
              createdBy: productData.createdBy
            };
            
            console.log("Sending PATCH request with simplified product data:", simplifiedProductData);
            const response = await apiRequest("PATCH", `/api/products/${initialData.id}`, simplifiedProductData);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error("Failed to update product:", errorText);
              throw new Error(`Failed to update product: ${errorText}`);
            }
            
            const updatedProduct = await response.json();
            console.log("Product updated successfully:", updatedProduct);
            
            // Step 2: Delete existing module associations
            console.log("Removing existing module associations");
            const deleteResponse = await apiRequest("DELETE", `/api/products/${initialData.id}/modules`);
            
            if (!deleteResponse.ok) {
              console.error("Failed to delete module associations but continuing with update");
            }
            
            // Step 3: Add new module associations if present
            if (modules && modules.length > 0) {
              console.log("Adding new module associations:", modules);
              
              for (const moduleAssoc of modules) {
                try {
                  // Get the correct moduleId - it's either in moduleId or id property
                  const moduleId = moduleAssoc.moduleId || moduleAssoc.id;
                  console.log(`Adding module association: id=${moduleAssoc.id}, moduleId=${moduleAssoc.moduleId}, using=${moduleId}`);
                  
                  // Make sure moduleId is a number
                  const parsedModuleId = parseInt(moduleId);
                  console.log("Parsed module ID:", parsedModuleId);
                  
                  if (isNaN(parsedModuleId)) {
                    console.error(`Invalid module ID: ${moduleId}, skipping`);
                    continue;
                  }
                  
                  const moduleResponse = await apiRequest("POST", `/api/products/${initialData.id}/modules`, {
                    moduleId: parsedModuleId,
                    createdBy: initialData.createdBy || (window as any)?.currentUser?.id || 33 // Use admin user ID as fallback
                  });
                  
                  if (!moduleResponse.ok) {
                    const errorText = await moduleResponse.text();
                    console.error(`Failed to add module ${moduleId} - ${errorText}`);
                  } else {
                    console.log(`Successfully added module ${moduleId}`);
                  }
                } catch (moduleError) {
                  console.error("Error adding module:", moduleError);
                  // Continue with other modules
                }
              }
            }
            
            return updatedProduct;
          } catch (editError) {
            console.error("Error in product edit flow:", editError);
            throw editError;
          }
        } else {
          // Create new product
          try {
            // Use same simplified approach for creates to avoid possible date issues
            const simplifiedProductData = {
              name: productData.name || "",
              description: productData.description || "",
              sku: productData.sku || "",
              price: productData.price || "0",
              tax: productData.tax || "0",
              vendorId: productData.vendorId || null,
              isActive: productData.isActive === false ? false : true,
              createdBy: productData.createdBy
            };
            
            console.log("Create mode detected, sending POST request with simplified product data:", simplifiedProductData);
            const response = await apiRequest("POST", "/api/products", simplifiedProductData);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error("Failed to create product:", errorText);
              throw new Error(`Failed to create product: ${errorText}`);
            }
            
            const newProduct = await response.json();
            console.log("Product created successfully:", newProduct);
            
            // Handle module associations if present
            if (modules && modules.length > 0) {
              console.log("Adding module associations for new product:", modules);
              
              for (const moduleAssoc of modules) {
                try {
                  // Get the correct moduleId - it's either in moduleId or id property
                  const moduleId = moduleAssoc.moduleId || moduleAssoc.id;
                  console.log("Adding module association with moduleId:", moduleId);
                  
                  // Ensure moduleId is passed correctly and add createdBy field
                  const moduleResponse = await apiRequest("POST", `/api/products/${newProduct.id}/modules`, {
                    moduleId: parseInt(moduleId),
                    createdBy: newProduct.createdBy || (window as any)?.currentUser?.id || 33 // Use admin user ID as fallback
                  });
                  
                  if (!moduleResponse.ok) {
                    console.error(`Failed to add module ${moduleId} but continuing with others`);
                  }
                } catch (moduleError) {
                  console.error("Error adding module:", moduleError);
                  // Continue with other modules
                }
              }
            }
            
            return newProduct;
          } catch (createError) {
            console.error("Error in product create flow:", createError);
            throw createError;
          }
        }
      } catch (error) {
        console.error("Product mutation error:", error);
        throw error;
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
    try {
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

      console.log("Dialog handleSubmit called with:", data);
      console.log("Formatted product data for mutation:", formattedData);
      console.log(`Mutation is ${productMutation.isPending ? "pending" : "not pending"}`);
      productMutation.mutate(formattedData);
    } catch (error) {
      console.error("Error in dialog handleSubmit:", error);
      toast({
        title: "Form Submission Error",
        description: `An error occurred while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
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