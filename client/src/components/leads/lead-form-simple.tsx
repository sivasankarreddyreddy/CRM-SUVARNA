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
import { Loader2 } from "lucide-react";

// Simple form schema
const leadFormSchema = z.object({
  name: z.string().min(1, "Lead name is required"),
  email: z.string().optional(),
  phone: z.string().optional(),
  companyId: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  status: z.string().default("new"),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
}

export function LeadForm({ open, onOpenChange, onSubmit, initialData = {}, isLoading = false }: LeadFormProps) {
  const { user } = useAuth();
  const { users, isLoading: usersLoading } = useUsers();
  const { companies, isLoading: companiesLoading } = useCompanies();

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      companyId: "",
      source: "",
      notes: "",
      assignedTo: "",
      status: "new",
    },
  });

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      if (initialData?.id) {
        // Editing mode
        form.reset({
          name: initialData.name || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          companyId: initialData.companyId ? String(initialData.companyId) : "",
          source: initialData.source || "",
          notes: initialData.notes || "",
          assignedTo: initialData.assignedTo ? String(initialData.assignedTo) : "",
          status: initialData.status || "new",
        });
      } else {
        // New lead mode
        form.reset({
          name: "",
          email: "",
          phone: "",
          companyId: "",
          source: "",
          notes: "",
          assignedTo: "",
          status: "new",
        });
      }
    }
  }, [open, initialData, form]);

  const handleSubmit = (data: LeadFormValues) => {
    const formattedData = {
      ...data,
      companyId: data.companyId ? Number(data.companyId) : null,
      assignedTo: data.assignedTo ? Number(data.assignedTo) : null,
    };
    onSubmit(formattedData);
    onOpenChange(false);
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
                      {...field}
                      disabled={isLoading}
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
                      {...field}
                      disabled={isLoading}
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
                      placeholder="9876543210" 
                      {...field}
                      disabled={isLoading}
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
                    disabled={isLoading || companiesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No Company</SelectItem>
                      {companies?.map((company: any) => (
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
                  <FormLabel>Source</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., website, referral, cold call" 
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading || usersLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {users?.map((user: any) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.fullName}
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
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
                      placeholder="Add any additional notes..." 
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData?.id ? "Update Lead" : "Create Lead"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}