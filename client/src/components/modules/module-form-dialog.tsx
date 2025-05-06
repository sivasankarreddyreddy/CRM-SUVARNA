import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiRequest } from "@/lib/queryClient";

const moduleSchema = z.object({
  name: z.string().min(2, "Module name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  isActive: z.boolean().default(true),
});

type ModuleFormValues = z.infer<typeof moduleSchema>;

interface ModuleFormDialogProps {
  initialData?: any;
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit" | "duplicate";
}

export function ModuleFormDialog({ initialData, isOpen, onClose, mode }: ModuleFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = mode === "edit" || mode === "duplicate";
  
  // Define form with validation
  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      isActive: true
    }
  });
  
  // Set form values from initialData if in edit mode
  useState(() => {
    if (initialData && isEditMode) {
      form.reset({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price ? String(initialData.price).replace(/[₹,]/g, '') : "",
        isActive: initialData.isActive !== undefined ? initialData.isActive : true
      });
    }
  });
  
  // Mutation for creating a module
  const createModuleMutation = useMutation({
    mutationFn: async (data: ModuleFormValues) => {
      const res = await apiRequest("POST", "/api/modules", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Module created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create module: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });
  
  // Mutation for updating a module
  const updateModuleMutation = useMutation({
    mutationFn: async (data: ModuleFormValues & { id: number }) => {
      const res = await apiRequest("PUT", `/api/modules/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Module updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update module: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });
  
  // Form submission handler
  const onSubmit = (data: ModuleFormValues) => {
    setIsSubmitting(true);
    
    if (mode === "edit") {
      updateModuleMutation.mutate({ ...data, id: initialData.id });
    } else {
      // Create new module (either in create mode or duplicate mode)
      createModuleMutation.mutate(data);
    }
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    form.reset();
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Module" : 
             mode === "edit" ? "Edit Module" : 
             "Duplicate Module"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Create a new functionality module for products" : 
             mode === "edit" ? "Update module information" : 
             "Create a copy of this module with new details"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter module name" {...field} />
                  </FormControl>
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
                      placeholder="Enter module description" 
                      className="min-h-[100px]"
                      {...field} 
                      value={field.value || ""}
                    />
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
                  <FormLabel>Price (₹) <span className="text-red-500">*</span></FormLabel>
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
                    Additional price for this module when added to a product
                  </FormDescription>
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
                    <FormDescription>
                      Inactive modules will not appear in selection lists
                    </FormDescription>
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
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="mr-2" size="sm" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditMode ? "Update Module" : "Create Module"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}