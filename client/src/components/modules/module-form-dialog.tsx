import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InsertModule } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

// Create a zod schema for form validation
const formSchema = z.object({
  name: z.string().min(1, "Module name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  price: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface ModuleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: any | null;
  mode: "create" | "edit" | "duplicate";
}

export function ModuleFormDialog({ isOpen, onClose, initialData, mode }: ModuleFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isEdit = mode === "edit";
  const isDuplicate = mode === "duplicate";

  // Set the dialog title based on the mode
  const dialogTitle = isEdit 
    ? "Edit Module" 
    : isDuplicate 
      ? "Duplicate Module" 
      : "Add New Module";

  // Initialize the form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData && (isEdit || isDuplicate) ? initialData.name : "",
      code: initialData && (isEdit || isDuplicate) ? initialData.code || "" : "",
      description: initialData && (isEdit || isDuplicate) ? initialData.description || "" : "",
      price: initialData && (isEdit || isDuplicate) ? initialData.price?.toString() || "" : "",
      isActive: initialData && isEdit ? initialData.isActive : true,
    },
  });

  // Create or update module mutation
  const mutation = useMutation({
    mutationFn: async (data: InsertModule) => {
      if (isEdit) {
        const res = await apiRequest("PUT", `/api/modules/${initialData.id}`, data);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/modules", data);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      toast({
        title: isEdit ? "Module Updated" : "Module Created",
        description: isEdit
          ? `${initialData.name} has been updated successfully.`
          : "New module has been added successfully.",
      });
      onClose();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} module: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to perform this action.",
        variant: "destructive",
      });
      return;
    }

    // Convert the price to string if it exists
    const moduleData: InsertModule = {
      name: data.name,
      code: data.code,
      description: data.description,
      price: data.price !== undefined ? data.price.toString() : undefined,
      isActive: data.isActive,
      createdBy: user.id,
    };

    mutation.mutate(moduleData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter module name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter module code (e.g., MOD-001)" {...field} value={field.value || ""} />
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
                      {...field} 
                      value={field.value || ""} 
                      className="min-h-[80px]"
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
                  <FormLabel>Price (₹)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                      <Input 
                        type="number" 
                        placeholder="Enter module price" 
                        {...field} 
                        value={field.value || ""} 
                        className="pl-7"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEdit && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Inactive modules will not appear in selection dropdowns.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Update Module" : "Add Module"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}