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
import { ModuleForm } from "./module-form";
import { apiRequest } from "@/lib/queryClient";

interface ModuleFormDialogProps {
  initialData?: any;
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit" | "duplicate";
}

export function ModuleFormDialog({ initialData, isOpen, onClose, mode }: ModuleFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const dialogTitle = mode === "create" ? "Create Module" : mode === "edit" ? "Edit Module" : "Duplicate Module";
  const dialogDescription = mode === "create" 
    ? "Add a new module to your system" 
    : mode === "edit" 
    ? "Update module information" 
    : "Create a copy of this module";

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

  // Create or update module mutation
  const moduleMutation = useMutation({
    mutationFn: async (data: any) => {
      if (mode === "edit") {
        // Update existing module
        const response = await apiRequest("PATCH", `/api/modules/${initialData.id}`, data);
        return await response.json();
      } else {
        // Create new module
        const response = await apiRequest("POST", "/api/modules", data);
        return await response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: mode === "edit" ? "Module Updated" : "Module Created",
        description: mode === "edit" 
          ? "The module has been updated successfully."
          : mode === "duplicate"
          ? "The module has been duplicated successfully."
          : "The new module has been created successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to ${mode === "edit" ? "update" : "create"} module: ${error.message}`,
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

    moduleMutation.mutate(formattedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <ModuleForm 
          initialData={formData} 
          onSubmit={handleSubmit} 
          isSubmitting={moduleMutation.isPending} 
          isEditMode={mode === "edit"}
        />
      </DialogContent>
    </Dialog>
  );
}