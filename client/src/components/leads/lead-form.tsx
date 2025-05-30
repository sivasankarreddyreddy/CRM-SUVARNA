import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-users";
import { useCompanies } from "@/hooks/use-companies";
import { Loader2, PlusCircle } from "lucide-react";

// Extend the insertLeadSchema for form validation
const leadFormSchema = z.object({
  name: z.string().min(1, { message: "Lead name is required" }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  phone: z.string().optional(),
  companyId: z.string().transform(val => val === "" ? null : Number(val)),
  companyName: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  assignedTo: z.string().nullable().transform(val => val === "" || val === "unassigned" ? null : Number(val)),
  status: z.string().default("new"),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LeadFormValues) => void;
  initialData?: any; // Using any to accommodate both lead objects and form values
  isLoading?: boolean;
}

export function LeadForm({ open, onOpenChange, onSubmit, initialData = {}, isLoading = false }: LeadFormProps) {
  console.log("LeadForm initialData:", initialData);
  console.log("LeadForm isEditMode:", !!initialData?.id);
  
  const { user } = useAuth();
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { companies, isLoading: isLoadingCompanies } = useCompanies();
  const canAssignLeads = user?.role === 'admin' || user?.role === 'sales_manager';
  
  // State to track selected company details
  const [selectedCompany, setSelectedCompany] = React.useState<any>(null);
  
  const form = useForm({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: initialData.name || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
      companyId: initialData.companyId ? String(initialData.companyId) : "",
      companyName: initialData.companyName || "",
      source: initialData.source || "",
      notes: initialData.notes || "",
      assignedTo: initialData.assignedTo ? String(initialData.assignedTo) : null,
      status: initialData.status || "new",
    },
  });
  
  // Reset form values when initialData changes (for editing) or when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      console.log("Resetting form - initialData:", initialData);
      
      const resetValues = {
        name: initialData?.name || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        companyId: initialData?.companyId ? String(initialData.companyId) : "",
        companyName: initialData?.companyName || "",
        source: initialData?.source || "",
        notes: initialData?.notes || "",
        assignedTo: initialData?.assignedTo ? String(initialData.assignedTo) : null,
        status: initialData?.status || "new",
      };
      
      form.reset(resetValues);
      
      // Set selected company if there's a companyId, otherwise clear it
      if (initialData?.companyId && companies) {
        const company = companies.find(c => c.id === initialData.companyId);
        setSelectedCompany(company || null);
      } else {
        setSelectedCompany(null);
      }
    }
  }, [open, initialData, form, companies]);

  // Watch for company selection changes
  const watchedCompanyId = form.watch("companyId");
  React.useEffect(() => {
    if (watchedCompanyId && companies) {
      const company = companies.find(c => c.id === Number(watchedCompanyId));
      setSelectedCompany(company || null);
    } else {
      setSelectedCompany(null);
    }
  }, [watchedCompanyId, companies]);

  const handleSubmit = (values: any) => {
    // If company is selected, get the company name for display purposes
    if (values.companyId) {
      const selectedCompany = companies?.find(c => c.id === Number(values.companyId));
      if (selectedCompany) {
        values.companyName = selectedCompany.name;
      }
    } else if (initialData.companyName) {
      // If company ID is not selected but there is a company name in the initial data,
      // preserve that company name to maintain backward compatibility
      values.companyName = initialData.companyName;
    }
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? "Edit Lead" : "Create New Lead"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter lead name" 
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
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
                  <FormLabel>Lead Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="email@example.com" 
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
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
                  <FormLabel>Lead Phone</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="9876543210, 9123456789" 
                      {...field}
                      onInput={(e) => {
                        // Allow only numeric characters and commas
                        const input = e.target as HTMLInputElement;
                        input.value = input.value.replace(/[^0-9,]/g, '');
                        field.onChange(input.value);
                      }}
                      maxLength={50}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={initialData?.companyId ? String(initialData.companyId) : ""}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.isArray(companies) && companies.length > 0 
                        ? companies.map(company => (
                            <SelectItem key={company.id} value={String(company.id)}>
                              {company.name}
                            </SelectItem>
                          ))
                        : <SelectItem value="none" disabled>No companies available</SelectItem>
                      }
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display company phone number when company is selected */}
            {selectedCompany && selectedCompany.phone && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-blue-800">Company Phone:</div>
                  <div className="text-sm text-blue-700">{selectedCompany.phone}</div>
                </div>
                {selectedCompany.address && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-sm font-medium text-blue-800">Address:</div>
                    <div className="text-sm text-blue-700">{selectedCompany.address}</div>
                  </div>
                )}
              </div>
            )}
            
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Source</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || "website"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="email">Email Campaign</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional information about this lead" 
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      rows={3} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {canAssignLeads && (
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value !== null ? String(field.value) : "unassigned"}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {Array.isArray(users) && users.length > 0
                          ? users
                              .filter(user => user.role === 'sales_executive' || user.role === 'sales_manager')
                              .map(user => (
                                <SelectItem key={user.id} value={String(user.id)}>
                                  {user.fullName} ({user.role === 'sales_executive' ? 'Sales Exec' : 'Sales Manager'})
                                </SelectItem>
                              ))
                          : <SelectItem value="none" disabled>No users available</SelectItem>
                        }
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter className="mt-6 sm:justify-between">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {initialData?.id ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  initialData?.id ? "Save Changes" : "Create Lead"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
