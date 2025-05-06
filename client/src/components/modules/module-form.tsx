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

const moduleSchema = z.object({
  name: z.string().min(1, { message: "Module name is required" }),
  description: z.string().optional(),
  price: z.string().min(1, { message: "Price is required" }),
  isActive: z.boolean().default(true)
});

type ModuleFormValues = z.infer<typeof moduleSchema>;

interface ModuleFormProps {
  initialData?: any;
  onSubmit: (data: ModuleFormValues) => void;
  isSubmitting: boolean;
  isEditMode?: boolean;
}

export function ModuleForm({ initialData, onSubmit, isSubmitting, isEditMode = false }: ModuleFormProps) {
  const { toast } = useToast();
  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      isActive: true
    }
  });

  // Set form values from initialData if provided
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price ? String(initialData.price).replace(/[₹,]/g, '') : "",
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
                  Active modules will be available for selection when creating products
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
              isEditMode ? "Update Module" : "Create Module"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}