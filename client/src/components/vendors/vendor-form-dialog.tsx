import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { InsertVendor, VendorGroup } from "@shared/schema";

// Form schema for validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).max(100),
  contactPerson: z.string().optional(),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  website: z.string().url({ message: "Invalid URL" }).optional().or(z.literal("")),
  description: z.string().optional(),
  vendorGroupId: z.number().optional().nullable(),
  isActive: z.boolean().default(true)
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
  
  // Debug logs for initialData
  console.log("Vendor Form Dialog - initialData:", initialData, "with vendorGroupId:", initialData?.vendorGroupId);
  console.log("Vendor Form Dialog - mode:", mode);
  
  // Fetch vendor groups
  const { data: vendorGroups = [], isLoading: isLoadingVendorGroups } = useQuery<VendorGroup[]>({
    queryKey: ["/api/vendor-groups"],
    enabled: isOpen, // Only fetch when dialog is open
  });
  
  // For edit mode, fetch the specific vendor data to ensure we have the latest
  const { data: vendorData, isLoading: isLoadingVendor } = useQuery({
    queryKey: [`/api/vendors/${initialData?.id}`],
    enabled: isOpen && mode === "edit" && !!initialData?.id,
  });

  // Use the fetched vendor data if available (for edit mode), otherwise use initialData
  // Create a clean, detached copy of the data to avoid any reference issues
  let formData = null;
  
  if (mode === "edit" && vendorData) {
    // Make sure we're working with a single vendor object, not an array
    const rawData = Array.isArray(vendorData) ? vendorData[0] : vendorData;
    
    // Create a clean copy with only the data we need
    formData = { ...rawData };
  } else if (initialData) {
    // For create or duplicate mode, or when vendorData is not available
    formData = { ...initialData };
  }
  
  // Convert vendorGroupId to a number if it exists
  if (formData && formData.vendorGroupId !== undefined && formData.vendorGroupId !== null) {
    formData.vendorGroupId = typeof formData.vendorGroupId === 'string' 
      ? parseInt(formData.vendorGroupId) 
      : formData.vendorGroupId;
  }
  
  console.log("Vendor Form Dialog - formData to use:", formData, "with vendorGroupId:", formData?.vendorGroupId);
  
  // Initialize form with empty defaults first, we'll reset it with actual data
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      website: "",
      description: "",
      vendorGroupId: null,
      isActive: true,
    }
  });
  
  // Reset form when dialog opens or data changes
  React.useEffect(() => {
    if (isOpen) {
      if (formData) {
        // Ensure all fields have proper default values
        // Special handling for vendorGroupId - it must be a number or null
        let vendorGroupId = null;
        
        if (formData.vendorGroupId !== undefined && formData.vendorGroupId !== null) {
          // Convert to number if it's a string or use as is if already a number
          vendorGroupId = typeof formData.vendorGroupId === 'string' 
            ? parseInt(formData.vendorGroupId, 10) 
            : formData.vendorGroupId;
            
          // If parsing failed or resulted in NaN, set to null
          if (isNaN(vendorGroupId)) {
            vendorGroupId = null;
          }
        }
        
        console.log("Processing vendorGroupId for form:", formData.vendorGroupId, 
          "type:", typeof formData.vendorGroupId,
          "converted to:", vendorGroupId, 
          "type:", typeof vendorGroupId);
        
        // Make a clean copy of the defaultValues to avoid reference issues
        const defaultValues = {
          // Start with only the fields we need in our form schema
          name: formData.name || "",
          contactPerson: formData.contactPerson || "",
          email: formData.email || "",
          phone: formData.phone || "",
          address: formData.address || "",
          city: formData.city || "",
          state: formData.state || "",
          country: formData.country || "",
          postalCode: formData.postalCode || "",
          website: formData.website || "",
          description: formData.description || "",
          vendorGroupId: vendorGroupId,
          isActive: formData.isActive !== undefined ? formData.isActive : true,
        };
        
        console.log("Setting form with defaultValues:", defaultValues);
        
        // Use setTimeout to ensure the form values are set after the component is fully rendered
        setTimeout(() => {
          form.reset(defaultValues);
        }, 0);
      } else if (mode === "create") {
        form.reset({
          name: "",
          contactPerson: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
          website: "",
          description: "",
          vendorGroupId: null,
          isActive: true,
        });
      }
    }
  }, [isOpen, formData, form, mode]);

  // Create Vendor Mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertVendor) => {
      const res = await apiRequest("POST", "/api/vendors", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      toast({
        title: "Vendor Created",
        description: "Vendor has been created successfully.",
      });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create vendor: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update Vendor Mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertVendor> & { id: number }) => {
      const { id, ...updateData } = data;
      const res = await apiRequest("PATCH", `/api/vendors/${id}`, updateData);
      return await res.json();
    },
    onSuccess: (data) => {
      // Invalidate both the list of vendors and the specific vendor
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      if (initialData?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/vendors/${initialData.id}`] });
      }
      toast({
        title: "Vendor Updated",
        description: "Vendor has been updated successfully.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update vendor: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: FormData) => {
    // Clean empty string fields to null
    const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = value === "" ? null : value;
      return acc;
    }, {} as Record<string, any>);

    console.log("Submitting vendor data:", cleanedData, "with vendorGroupId:", cleanedData.vendorGroupId);

    if (mode === "edit" && initialData?.id) {
      updateMutation.mutate({ ...cleanedData, id: initialData.id });
    } else {
      // For both create and duplicate modes
      createMutation.mutate(cleanedData as InsertVendor);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const title = mode === "create" ? "Create Vendor" : mode === "edit" ? "Edit Vendor" : "Duplicate Vendor";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter vendor name" 
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact Person */}
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter contact person" 
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter email address" 
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter phone number" 
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Website */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com" 
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Vendor Group */}
              <FormField
                control={form.control}
                name="vendorGroupId"
                render={({ field }) => {
                  // Debug the field value
                  console.log("Vendor Group field value:", field.value, 
                    "type:", typeof field.value,
                    "is null:", field.value === null,
                    "is undefined:", field.value === undefined);
                    
                  return (
                    <FormItem>
                      <FormLabel>Vendor Group</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            console.log("Selected vendor group value:", value);
                            field.onChange(value === "null" ? null : parseInt(value));
                          }}
                          value={field.value === null || field.value === undefined ? "null" : String(field.value)}
                          defaultValue="null"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="null">No group</SelectItem>
                            {vendorGroups.map((group) => (
                              <SelectItem key={group.id} value={group.id.toString()}>
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </div>

            {/* Address Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter street address" 
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* City */}
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter city" 
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* State */}
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter state/province" 
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Postal Code */}
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter postal code" 
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Country */}
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter vendor description" 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Switch */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Vendor will be {field.value ? "visible" : "hidden"} in the active vendors list
                    </p>
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

            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? "Create" : mode === "edit" ? "Update" : "Duplicate"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}