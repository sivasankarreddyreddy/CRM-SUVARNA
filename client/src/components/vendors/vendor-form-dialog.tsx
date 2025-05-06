import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InsertVendor } from "@shared/schema";
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
  name: z.string().min(1, "Vendor name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface VendorFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: any | null;
  mode: "create" | "edit" | "duplicate";
}

export function VendorFormDialog({ isOpen, onClose, initialData, mode }: VendorFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isEdit = mode === "edit";
  const isDuplicate = mode === "duplicate";

  // Set the dialog title based on the mode
  const dialogTitle = isEdit 
    ? "Edit Vendor" 
    : isDuplicate 
      ? "Duplicate Vendor" 
      : "Add New Vendor";

  // Initialize the form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData && (isEdit || isDuplicate) ? initialData.name : "",
      contactPerson: initialData && (isEdit || isDuplicate) ? initialData.contactPerson || "" : "",
      email: initialData && (isEdit || isDuplicate) ? initialData.email || "" : "",
      phone: initialData && (isEdit || isDuplicate) ? initialData.phone || "" : "",
      website: initialData && (isEdit || isDuplicate) ? initialData.website || "" : "",
      address: initialData && (isEdit || isDuplicate) ? initialData.address || "" : "",
      isActive: initialData && isEdit ? initialData.isActive : true,
    },
  });

  // Create or update vendor mutation
  const mutation = useMutation({
    mutationFn: async (data: InsertVendor) => {
      if (isEdit) {
        const res = await apiRequest("PUT", `/api/vendors/${initialData.id}`, data);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/vendors", data);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      toast({
        title: isEdit ? "Vendor Updated" : "Vendor Created",
        description: isEdit
          ? `${initialData.name} has been updated successfully.`
          : "New vendor has been added successfully.",
      });
      onClose();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} vendor: ${error.message}`,
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

    const vendorData: InsertVendor = {
      ...data,
      createdBy: user.id,
    };

    mutation.mutate(vendorData);
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
                  <FormLabel>Vendor Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter vendor name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact person name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter website URL" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter address" {...field} value={field.value || ""} />
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
                        Inactive vendors will not appear in selection dropdowns.
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
                {isEdit ? "Update Vendor" : "Add Vendor"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}