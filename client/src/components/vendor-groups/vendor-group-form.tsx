import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { insertVendorGroupSchema, VendorGroup } from "@shared/schema";

// Extend the schema with client-side validation
const vendorGroupFormSchema = insertVendorGroupSchema.extend({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type VendorGroupFormValues = z.infer<typeof vendorGroupFormSchema>;

interface VendorGroupFormProps {
  initialData?: VendorGroup;
  onSubmit: (data: VendorGroupFormValues) => void;
  onCancel: () => void;
}

export function VendorGroupForm({ initialData, onSubmit, onCancel }: VendorGroupFormProps) {
  const form = useForm<VendorGroupFormValues>({
    resolver: zodResolver(vendorGroupFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        description: initialData.description || "",
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter vendor group name" {...field} />
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
                  placeholder="Enter vendor group description"
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update" : "Create"} Vendor Group
          </Button>
        </div>
      </form>
    </Form>
  );
}