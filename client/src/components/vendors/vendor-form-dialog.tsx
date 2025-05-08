import React, { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
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
  const [formValues, setFormValues] = useState<any>({
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
    isActive: true
  });
  
  // Fetch vendor groups
  const { data: vendorGroups = [] } = useQuery<VendorGroup[]>({
    queryKey: ["/api/vendor-groups"],
    enabled: isOpen,
  });
  
  // Initialize form with initial data
  useEffect(() => {
    if (isOpen && initialData) {
      // Create a clean copy of the initialData
      const newFormValues = {
        name: initialData.name || "",
        contactPerson: initialData.contactPerson || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        city: initialData.city || "",
        state: initialData.state || "",
        country: initialData.country || "",
        postalCode: initialData.postalCode || "",
        website: initialData.website || "",
        description: initialData.description || "",
        vendorGroupId: initialData.vendorGroupId,
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      };
      setFormValues(newFormValues);
    } else if (isOpen && mode === "create") {
      // Reset to empty for create mode
      setFormValues({
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
        isActive: true
      });
    }
  }, [isOpen, initialData, mode]);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
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

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev: any) => ({ ...prev, [name]: value }));
  };

  // Handle switch change
  const handleSwitchChange = (checked: boolean) => {
    setFormValues((prev: any) => ({ ...prev, isActive: checked }));
  };

  // Handle vendor group change
  const handleVendorGroupChange = (value: string) => {
    setFormValues((prev: any) => ({ 
      ...prev, 
      vendorGroupId: value === "null" ? null : parseInt(value)
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    try {
      const validatedData = formSchema.parse(formValues);
      
      // Clean empty string fields to null
      const cleanedData = Object.entries(validatedData).reduce((acc, [key, value]) => {
        acc[key] = value === "" ? null : value;
        return acc;
      }, {} as Record<string, any>);
      
      if (mode === "edit" && initialData?.id) {
        updateMutation.mutate({ ...cleanedData, id: initialData.id });
      } else {
        // For both create and duplicate modes
        createMutation.mutate(cleanedData as InsertVendor);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const fieldErrors = error.errors.reduce((acc, err) => {
          const field = err.path[0];
          acc[field] = err.message;
          return acc;
        }, {} as Record<string, string>);
        
        toast({
          title: "Validation Error",
          description: "Please check the form for errors.",
          variant: "destructive",
        });
        
        console.error("Form validation errors:", fieldErrors);
      }
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-2">
              <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
              <Input 
                id="name"
                name="name"
                placeholder="Enter vendor name"
                value={formValues.name || ""}
                onChange={handleChange}
                required
              />
            </div>

            {/* Contact Person */}
            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input 
                id="contactPerson"
                name="contactPerson"
                placeholder="Enter contact person"
                value={formValues.contactPerson || ""}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                name="email"
                placeholder="Enter email address"
                value={formValues.email || ""}
                onChange={handleChange}
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone"
                name="phone"
                placeholder="Enter phone number"
                value={formValues.phone || ""}
                onChange={handleChange}
              />
            </div>

            {/* Website */}
            <div>
              <Label htmlFor="website">Website</Label>
              <Input 
                id="website"
                name="website"
                placeholder="https://example.com"
                value={formValues.website || ""}
                onChange={handleChange}
              />
            </div>

            {/* Vendor Group */}
            <div>
              <Label htmlFor="vendorGroupId">Vendor Group</Label>
              <Select
                value={formValues.vendorGroupId === null ? "null" : String(formValues.vendorGroupId)}
                onValueChange={handleVendorGroupChange}
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
            </div>
          </div>

          {/* Address Section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-medium mb-4">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Address */}
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address"
                  name="address"
                  placeholder="Enter address"
                  value={formValues.address || ""}
                  onChange={handleChange}
                />
              </div>

              {/* City */}
              <div>
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city"
                  name="city"
                  placeholder="Enter city"
                  value={formValues.city || ""}
                  onChange={handleChange}
                />
              </div>

              {/* State/Province */}
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input 
                  id="state"
                  name="state"
                  placeholder="Enter state/province"
                  value={formValues.state || ""}
                  onChange={handleChange}
                />
              </div>

              {/* Postal Code */}
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input 
                  id="postalCode"
                  name="postalCode"
                  placeholder="Enter postal code"
                  value={formValues.postalCode || ""}
                  onChange={handleChange}
                />
              </div>

              {/* Country */}
              <div>
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country"
                  name="country"
                  placeholder="Enter country"
                  value={formValues.country || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              name="description"
              placeholder="Enter vendor description"
              value={formValues.description || ""}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Status Switch */}
          <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <Label className="text-base">Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Vendor will be {formValues.isActive ? "visible" : "hidden"} in the active vendors list
              </p>
            </div>
            <Switch
              checked={formValues.isActive || false}
              onCheckedChange={handleSwitchChange}
            />
          </div>

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
      </DialogContent>
    </Dialog>
  );
}