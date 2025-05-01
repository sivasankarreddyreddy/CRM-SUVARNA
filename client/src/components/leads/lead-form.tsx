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
  
  // Reset form values when initialData changes (e.g., when editing a different lead)
  React.useEffect(() => {
    if (initialData?.id) {
      console.log("Resetting form with lead data:", initialData);
      form.reset({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        companyId: initialData.companyId ? String(initialData.companyId) : "",
        companyName: initialData.companyName || "",
        source: initialData.source || "",
        notes: initialData.notes || "",
        assignedTo: initialData.assignedTo ? String(initialData.assignedTo) : null,
        status: initialData.status || "new",
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: any) => {
    // If company is selected, get the company name for display purposes
    if (values.companyId) {
      const selectedCompany = companies?.find(c => c.id === Number(values.companyId));
      if (selectedCompany) {
        values.companyName = selectedCompany.name;
      }
    }
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
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
                    <Input placeholder="Enter lead name" {...field} />
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
                    <Input type="email" placeholder="email@example.com" {...field} />
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
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
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
                        <SelectValue placeholder="Select a company">
                          {isLoadingCompanies ? (
                            <div className="flex items-center">
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Loading companies...
                            </div>
                          ) : field.value ? (
                            companies?.find(c => c.id === Number(field.value))?.name || "Select a company"
                          ) : (
                            "Select a company"
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies?.map(company => (
                        <SelectItem key={company.id} value={String(company.id)}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                    <Textarea placeholder="Additional information about this lead" {...field} rows={3} />
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
                          <SelectValue placeholder="Select a user">
                            {isLoadingUsers ? (
                              <div className="flex items-center">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Loading users...
                              </div>
                            ) : (field.value !== null && field.value !== undefined) ? (
                              users?.find(u => u.id === Number(field.value))?.fullName || "Select a user"
                            ) : (
                              "Select a user"
                            )}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {users?.filter(user => user.role === 'sales_executive' || user.role === 'sales_manager')
                          .map(user => (
                            <SelectItem key={user.id} value={String(user.id)}>
                              {user.fullName} ({user.role === 'sales_executive' ? 'Sales Exec' : 'Sales Manager'})
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="pt-3 flex flex-row justify-between items-center w-full">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading 
                  ? (initialData?.id ? "Saving..." : "Creating...") 
                  : (initialData?.id ? "Save Changes" : "Create Lead")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
