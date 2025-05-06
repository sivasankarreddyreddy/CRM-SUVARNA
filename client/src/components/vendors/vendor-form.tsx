import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const vendorSchema = z.object({
  name: z.string().min(1, { message: "Vendor name is required" }),
  description: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  isActive: z.boolean().default(true)
});

type VendorFormValues = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  initialData?: any;
  onSubmit: (data: VendorFormValues) => void;
  isSubmitting: boolean;
  isEditMode?: boolean;
}

export function VendorForm({ initialData, onSubmit, isSubmitting, isEditMode = false }: VendorFormProps) {
  const { toast } = useToast();
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      description: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      isActive: true
    }
  });

  // Set form values from initialData if provided
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        description: initialData.description || "",
        contactPerson: initialData.contactPerson || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        website: initialData.website || "",
        isActive: initialData.isActive !== undefined ? initialData.isActive : true
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor Name <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Enter vendor name" {...field} />
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
                  placeholder="Enter vendor description" 
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
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact person name" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="Enter email address" 
                    {...field}
                    value={field.value || ""} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input 
                    type="tel" 
                    placeholder="Enter phone number" 
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
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="Enter website URL" 
                    {...field}
                    value={field.value || ""} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter vendor address" 
                  className="min-h-[80px]"
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
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Active vendors will appear in product creation forms
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

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner className="mr-2" size="sm" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEditMode ? "Update Vendor" : "Create Vendor"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}