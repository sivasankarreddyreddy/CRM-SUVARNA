import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { X, Plus, Check, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ModuleDetailDialog } from "@/components/modules/module-detail-dialog";

const productSchema = z.object({
  name: z.string().min(1, { message: "Product name is required" }),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.string().min(1, { message: "Price is required" }),
  tax: z.string().optional(),
  vendorId: z.string().min(1, { message: "Vendor is required" }),
  isActive: z.boolean().default(true)
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  isEditMode?: boolean;
}

export function ProductForm({ initialData, onSubmit, isSubmitting, isEditMode = false }: ProductFormProps) {
  console.log("ProductForm rendered with:", { initialData, isSubmitting, isEditMode });
  console.log("onSubmit is function:", typeof onSubmit === 'function');
  const { toast } = useToast();
  const [selectedModules, setSelectedModules] = useState<any[]>([]);
  const [showModuleSelector, setShowModuleSelector] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [isModuleDetailOpen, setIsModuleDetailOpen] = useState(false);

  // Fetch vendors
  const { data: vendorsResponse, isLoading: isLoadingVendors } = useQuery({
    queryKey: ["/api/vendors"],
  });
  
  // Extract the data array from the paginated vendors response
  const vendors = vendorsResponse?.data || [];
  
  // Debug vendors response
  useEffect(() => {
    console.log("Vendors response:", vendorsResponse);
    console.log("Extracted vendors:", vendors);
  }, [vendorsResponse, vendors]);

  // Fetch modules
  const { data: modulesResponse, isLoading: isLoadingModules } = useQuery({
    queryKey: ["/api/modules"],
  });
  
  // Extract the data array from the paginated modules response
  const modules = modulesResponse?.data || [];

  // Fetch product modules if in edit mode - with custom queryFn for direct API call
  const { data: productModules, isLoading: isLoadingProductModules } = useQuery({
    queryKey: [`/api/products/${initialData?.id}/modules`],
    enabled: isEditMode && !!initialData?.id,
    queryFn: async () => {
      console.log(`Fetching modules for product ${initialData?.id}`);
      const response = await fetch(`/api/products/${initialData?.id}/modules`);
      if (!response.ok) {
        throw new Error('Failed to fetch product modules');
      }
      const modules = await response.json();
      console.log("Fetched product modules:", modules);
      return modules;
    }
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      price: "",
      tax: "18", // Default tax rate
      vendorId: "",
      isActive: true
    }
  });

  // Load product modules when available
  useEffect(() => {
    if (Array.isArray(productModules) && !isLoadingProductModules) {
      console.log("Product modules loaded:", productModules);
      
      if (isEditMode && Array.isArray(modules)) {
        console.log("All modules available:", modules);
        
        // When editing, convert the product modules to full module objects
        // The server already returns full module objects with a productModuleId property
        // We just need to make sure the modules are correctly handled
        const enhancedModules = productModules.map(pm => {
          console.log("Processing product module:", pm);
          // Each module already has its id and other data
          // We just need to make sure it has the productModuleId property
          return {
            ...pm,
            productModuleId: pm.productModuleId || pm.id
          };
        });
        
        console.log("Enhanced modules:", enhancedModules);
        setSelectedModules(enhancedModules.filter(Boolean));
      } else {
        setSelectedModules(productModules);
      }
      
      // Auto-show module selector if there are existing modules
      if (productModules.length > 0) {
        setShowModuleSelector(true);
      }
    }
  }, [productModules, isLoadingProductModules, modules, isEditMode]);

  // Set form values from initialData if in edit mode
  useEffect(() => {
    if (initialData && isEditMode) {
      form.reset({
        name: initialData.name || "",
        description: initialData.description || "",
        sku: initialData.sku || "",
        price: initialData.price ? String(initialData.price).replace(/[₹,]/g, '') : "",
        tax: initialData.tax ? String(initialData.tax).replace(/%/g, '') : "18",
        vendorId: initialData.vendorId ? String(initialData.vendorId) : "",
        isActive: initialData.isActive !== undefined ? initialData.isActive : true
      });
    }
  }, [initialData, isEditMode, form]);

  // Handle module selection with better support for different module structures
  const toggleModuleSelection = (module: any) => {
    // Check if module is already selected using either id or moduleId
    const isSelected = isModuleSelected(module.id);
    
    if (isSelected) {
      // Remove the module from the selection, accounting for different structures
      setSelectedModules(selectedModules.filter(m => {
        // If this is a direct module match
        if (m.id === module.id) return false;
        // If this is a product-module relationship matching this module
        if (m.moduleId === module.id) return false;
        // Keep all other modules
        return true;
      }));
    } else {
      // Add the module to the selection
      setSelectedModules([...selectedModules, module]);
    }
  };

  // Check if a module is selected
  // Modified to handle both module IDs and productModules with moduleId
  const isModuleSelected = (moduleId: number) => {
    return selectedModules.some(m => 
      // Handle both direct modules and product-module relationships
      (m.id === moduleId) || (m.moduleId === moduleId)
    );
  };

  // Calculate total price including selected modules
  const calculateTotalPrice = () => {
    const basePrice = parseFloat(form.getValues("price") || "0");
    const modulesPriceTotal = selectedModules.reduce((total, module) => {
      // Handle numeric or string price values
      const modulePrice = typeof module.price === 'number' 
        ? module.price 
        : parseFloat(module.price || '0');
      return total + modulePrice;
    }, 0);
    
    return basePrice + modulesPriceTotal;
  };

  // Custom submit handler to include selected modules
  const handleSubmit = (data: ProductFormValues) => {
    try {
      console.log("Form submitted with data:", data);
      
      // Format the module data properly for submission
      const formattedModules = selectedModules.map(module => {
        console.log("Processing module:", module);
        return { 
          // If the module comes from a product-module relationship, use its module ID
          // Otherwise, use the module's own ID
          moduleId: module.moduleId || module.id,
          isActive: true
        };
      });
      
      const formattedData = {
        ...data,
        modules: formattedModules
      };
      
      console.log("Calling onSubmit with formatted data:", formattedData);
      onSubmit(formattedData);
      console.log("onSubmit called successfully");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };
  
  // Direct submit function for product updates
  const handleUpdateProduct = async () => {
    try {
      console.log("Direct update product function called");
      if (!isEditMode || !initialData?.id) {
        console.error("Cannot update product: not in edit mode or no initial data");
        return;
      }
      
      // Get current form values
      const currentValues = form.getValues();
      console.log("Form values:", currentValues);
      
      // Format modules - make sure we have proper moduleId values
      const formattedModules = selectedModules.map(module => {
        // Use either moduleId or id as the moduleId value
        const moduleId = module.moduleId || module.id;
        console.log(`Processing module: id=${module.id}, moduleId=${moduleId}`);
        return {
          moduleId: parseInt(String(moduleId)),
          isActive: true
        };
      });
      
      // Format data - ensuring strings for price and tax
      const productData = {
        name: currentValues.name || "",
        description: currentValues.description || "", 
        sku: currentValues.sku || "",
        price: currentValues.price ? currentValues.price.toString() : "0",
        tax: currentValues.tax ? currentValues.tax.toString() : "0",
        vendorId: parseInt(currentValues.vendorId) || null,
        isActive: currentValues.isActive === false ? false : true,
        createdBy: initialData?.createdBy || (window as any)?.currentUser?.id || 33
      };
      
      console.log("Updating product with data:", productData);
      
      // Step 1: Update product
      const updateResponse = await fetch(`/api/products/${initialData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Failed to update product: ${await updateResponse.text()}`);
      }
      
      const updatedProduct = await updateResponse.json();
      console.log("Product updated successfully:", updatedProduct);
      
      // Step 2: Delete existing modules
      console.log("Deleting existing module associations for product ID:", initialData.id);
      const deleteResponse = await fetch(`/api/products/${initialData.id}/modules`, {
        method: 'DELETE'
      });
      
      if (!deleteResponse.ok) {
        console.warn("Warning: Failed to delete module associations but continuing");
      } else {
        console.log("Successfully deleted existing module associations");
      }
      
      // Step 3: Add updated modules
      if (formattedModules.length > 0) {
        console.log(`Adding ${formattedModules.length} module associations:`, formattedModules);
        
        for (const moduleAssoc of formattedModules) {
          console.log(`Adding module association for moduleId: ${moduleAssoc.moduleId}`);
          
          const moduleResponse = await fetch(`/api/products/${initialData.id}/modules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              moduleId: moduleAssoc.moduleId,
              createdBy: productData.createdBy
            })
          });
          
          if (!moduleResponse.ok) {
            const errorText = await moduleResponse.text();
            console.error(`Failed to add module ${moduleAssoc.moduleId}: ${errorText}`);
          } else {
            const result = await moduleResponse.json();
            console.log(`Successfully added module ${moduleAssoc.moduleId}. Result:`, result);
          }
        }
      } else {
        console.log("No modules to add for this product");
      }
      
      // Show success message
      toast({
        title: "Product Updated",
        description: "The product has been updated successfully.",
        variant: "default"
      });
      
      // Invalidate queries to refresh the products list
      try {
        // Properly invalidate the queries using imported queryClient
        console.log("Invalidating product queries");
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        // Also invalidate the specific product's modules query
        queryClient.invalidateQueries({ queryKey: [`/api/products/${initialData.id}/modules`] });
      } catch (err) {
        console.error("Error invalidating queries:", err);
      }
      
      // Close dialog if needed
      if (onSubmit) {
        // Send a notification that we've directly updated the product
        onSubmit({ 
          ...updatedProduct, 
          directUpdate: true 
        });
      }
      
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "An error occurred while updating the product",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={(e) => {
          console.log("Form submit event triggered");
          form.handleSubmit((formData) => {
            console.log("Form handleSubmit callback executing with data:", formData);
            handleSubmit(formData);
          })(e);
        }} 
        className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vendorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor <span className="text-red-500">*</span></FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingVendors ? (
                    <div className="flex items-center justify-center py-2">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Loading vendors...</span>
                    </div>
                  ) : !Array.isArray(vendors) || vendors.length === 0 ? (
                    <div className="p-2 text-center text-muted-foreground">No vendors available</div>
                  ) : (
                    Array.isArray(vendors) && vendors
                      .filter((vendor: any) => vendor.isActive)
                      .map((vendor: any) => (
                        <SelectItem key={vendor.id} value={String(vendor.id)}>
                          {vendor.name}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter product description" 
                  className="min-h-[100px]"
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product SKU" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Price (₹) <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    placeholder="0.00" 
                    {...field} 
                    onChange={(e) => {
                      // Only allow numbers and decimal point
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Base price without modules
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Rate (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    placeholder="0" 
                    {...field} 
                    value={field.value || ""}
                    onChange={(e) => {
                      // Only allow numbers
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Active</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    This product will be available for selection in quotations and orders
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Modules Selection */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <FormLabel className="text-base">Included Modules</FormLabel>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                setShowModuleSelector(!showModuleSelector);
              }}
            >
              {showModuleSelector ? "Hide Modules" : "Add Modules"}
            </Button>
          </div>

          {/* Selected modules list */}
          {selectedModules.length > 0 ? (
            <div className="border rounded-md p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {selectedModules.map(module => (
                  <Badge key={module.id} variant="outline" className="py-1.5 px-2.5 flex items-center gap-1.5">
                    <span 
                      className="cursor-pointer flex items-center"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedModule(module);
                        setIsModuleDetailOpen(true);
                      }}
                    >
                      {module.name}
                      <Info className="h-3 w-3 ml-1 text-muted-foreground hover:text-primary" />
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">₹{module.price?.toLocaleString() || '0'}</span>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1 rounded-full" 
                      onClick={(e) => {
                        e.preventDefault();
                        toggleModuleSelection(module);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="text-sm space-y-1 mt-2 border-t pt-2">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>₹{parseFloat(form.getValues("price") || "0").toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Modules Total:</span>
                  <span>₹{(calculateTotalPrice() - parseFloat(form.getValues("price") || "0")).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Package Price:</span>
                  <span>₹{calculateTotalPrice().toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-md p-4 text-center text-muted-foreground">
              No modules added to this product
            </div>
          )}

          {/* Module selector */}
          {showModuleSelector && (
            <div className="border rounded-md p-4 mt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium">Available Modules</h3>
                <p className="text-xs text-muted-foreground">Click on module name to view details</p>
              </div>
              
              {isLoadingModules ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Loading modules...</span>
                </div>
              ) : !Array.isArray(modules) || modules.length === 0 ? (
                <div className="text-center text-muted-foreground py-2">No modules available</div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto p-1">
                  {Array.isArray(modules) && modules
                    .filter((module: any) => module.isActive)
                    .map((module: any) => (
                      <div 
                        key={module.id} 
                        className={`
                          flex items-center justify-between p-3 border rounded-md cursor-pointer
                          ${isModuleSelected(module.id) ? 'bg-primary/10 border-primary/30' : ''}
                        `}
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            checked={isModuleSelected(module.id)} 
                            onCheckedChange={(checked) => {
                              // Prevent form submission
                              toggleModuleSelection(module);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                          />
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedModule(module);
                              setIsModuleDetailOpen(true);
                            }}
                          >
                            <p className="font-medium flex items-center">
                              {module.name}
                              <Info className="h-4 w-4 ml-1 text-muted-foreground hover:text-primary" />
                            </p>
                            <p className="text-sm text-muted-foreground">{module.description || 'No description'}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-right">
                            <p className="font-medium">
                              ₹{typeof module.price === 'number' 
                                ? module.price.toLocaleString() 
                                : parseFloat(module.price || '0').toLocaleString()}
                            </p>
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="ml-2" 
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              toggleModuleSelection(module);
                            }}
                          >
                            {isModuleSelected(module.id) ? 'Remove' : 'Add'}
                          </Button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          {isEditMode ? (
            // Special update button for edit mode
            <Button 
              type="button" 
              disabled={isSubmitting}
              onClick={(e) => {
                e.preventDefault();
                console.log("Update Product button clicked - direct function call");
                // Call the direct update function
                handleUpdateProduct();
              }}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="mr-2" size="sm" />
                  Updating...
                </>
              ) : (
                "Update Product"
              )}
            </Button>
          ) : (
            // Normal submit button for create mode
            <Button 
              type="button" 
              disabled={isSubmitting}
              onClick={(e) => {
                e.preventDefault();
                console.log("Create Product button clicked");
                // Use the form's submit handler
                form.handleSubmit(handleSubmit)();
              }}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="mr-2" size="sm" />
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          )}
        </div>
      </form>
      
      {/* Module detail dialog */}
      {selectedModule && (
        <ModuleDetailDialog
          module={selectedModule}
          isOpen={isModuleDetailOpen}
          onClose={() => setIsModuleDetailOpen(false)}
        />
      )}
    </Form>
  );
}