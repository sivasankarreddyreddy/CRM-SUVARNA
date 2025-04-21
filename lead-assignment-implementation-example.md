# Lead Assignment Implementation Code Example

This document provides a practical implementation example for the lead assignment functionality in the CRM system. It shows how the lead form component should be expanded to include user assignment.

## 1. Updated Lead Form Component

Below is the enhanced version of the lead form component that includes the assignment field:

```tsx
// client/src/components/leads/lead-form.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";

// Extend the insertLeadSchema for form validation
const leadFormSchema = z.object({
  name: z.string().min(1, { message: "Lead name is required" }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  assignedTo: z.coerce.number().optional(),
  status: z.string().default("new"),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LeadFormValues) => void;
  initialData?: Partial<LeadFormValues>;
  isLoading?: boolean;
}

export function LeadForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData = {}, 
  isLoading = false 
}: LeadFormProps) {
  const { user } = useAuth();
  
  // Fetch users for assignment dropdown
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return await res.json();
    },
  });

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: initialData.name || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
      companyName: initialData.companyName || "",
      source: initialData.source || "",
      notes: initialData.notes || "",
      assignedTo: initialData.assignedTo || user?.id,
      status: initialData.status || "new",
    },
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as any, value);
        }
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: LeadFormValues) => {
    onSubmit(values);
  };

  // Check if user has permission to assign leads
  const canAssignLeads = user && (user.role === "admin" || user.role === "sales_manager");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData.id ? "Edit Lead" : "Create New Lead"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Name *</FormLabel>
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <SelectItem value="event">Event/Trade Show</SelectItem>
                        <SelectItem value="cold_call">Cold Call</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Assignment Field - Only shown to Admin and Sales Manager roles */}
              {canAssignLeads && (
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users?.map((user: any) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.fullName} ({user.role === 'admin' 
                                ? 'Admin' 
                                : user.role === 'sales_manager' 
                                  ? 'Sales Manager' 
                                  : 'Sales Executive'
                              })
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            {initialData.id && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <SelectItem value="disqualified">Disqualified</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional information about this lead" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading 
                  ? (initialData.id ? "Saving..." : "Creating...") 
                  : (initialData.id ? "Save Changes" : "Create Lead")
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

## 2. Backend API for Lead Assignment

The server-side REST endpoint that handles the lead assignment:

```typescript
// server/routes.ts (excerpt)

// Route to assign a lead to a user
app.patch("/api/leads/:id/assign", authMiddleware, async (req, res) => {
  try {
    const leadId = parseInt(req.params.id);
    const { assignedTo, assignmentNotes } = req.body;
    
    // Verify user has permission to assign leads
    if (req.user.role !== 'admin' && req.user.role !== 'sales_manager') {
      return res.status(403).json({ error: "Permission denied" });
    }
    
    // Get the lead to be assigned
    const lead = await storage.getLead(leadId);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    
    // Get the user to assign to
    const assignee = await storage.getUser(assignedTo);
    if (!assignee) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Update the lead with the new assignment
    const updatedLead = await storage.updateLead(leadId, { 
      assignedTo,
      // If the lead was previously unassigned, set status to "new"
      status: lead.assignedTo ? lead.status : "new" 
    });
    
    // Log the assignment activity
    await storage.createActivity({
      type: "assignment",
      title: `Lead assigned to ${assignee.fullName}`,
      description: assignmentNotes || `Lead was assigned by ${req.user.fullName}`,
      relatedTo: "lead",
      relatedId: leadId,
      createdBy: req.user.id
    });
    
    // Return the updated lead
    res.json(updatedLead);
  } catch (error) {
    console.error("Error assigning lead:", error);
    res.status(500).json({ error: "Failed to assign lead" });
  }
});

// Route to handle bulk lead assignment
app.post("/api/leads/bulk-assign", authMiddleware, async (req, res) => {
  try {
    const { leadIds, assignedTo, notes } = req.body;
    
    // Verify user has permission to assign leads
    if (req.user.role !== 'admin' && req.user.role !== 'sales_manager') {
      return res.status(403).json({ error: "Permission denied" });
    }
    
    // Get the user to assign to
    const assignee = await storage.getUser(assignedTo);
    if (!assignee) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Update each lead
    const results = await Promise.all(
      leadIds.map(async (leadId: number) => {
        try {
          const lead = await storage.getLead(leadId);
          if (!lead) return { id: leadId, success: false, error: "Lead not found" };
          
          // Update the lead assignment
          await storage.updateLead(leadId, { assignedTo });
          
          // Log the activity
          await storage.createActivity({
            type: "assignment",
            title: `Lead assigned to ${assignee.fullName}`,
            description: notes || `Bulk assignment by ${req.user.fullName}`,
            relatedTo: "lead",
            relatedId: leadId,
            createdBy: req.user.id
          });
          
          return { id: leadId, success: true };
        } catch (err) {
          return { id: leadId, success: false, error: (err as Error).message };
        }
      })
    );
    
    // Return results
    res.json({
      success: results.every(r => r.success),
      results
    });
  } catch (error) {
    console.error("Error in bulk lead assignment:", error);
    res.status(500).json({ error: "Failed to perform bulk assignment" });
  }
});
```

## 3. Assignment Modal for Bulk Assignment

Here's a modal component for bulk assigning multiple leads at once:

```tsx
// client/src/components/leads/bulk-assign-modal.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const assignFormSchema = z.object({
  assignedTo: z.string(),
  notes: z.string().optional(),
});

type AssignFormValues = z.infer<typeof assignFormSchema>;

interface BulkAssignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLeads: number[];
}

export function BulkAssignModal({
  open,
  onOpenChange,
  selectedLeads,
}: BulkAssignModalProps) {
  const { toast } = useToast();
  
  // Fetch users for assignment dropdown
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["/api/users"],
  });

  const form = useForm<AssignFormValues>({
    resolver: zodResolver(assignFormSchema),
    defaultValues: {
      assignedTo: "",
      notes: "",
    },
  });

  // Mutation for bulk lead assignment
  const assignMutation = useMutation({
    mutationFn: async (values: AssignFormValues) => {
      const res = await apiRequest("POST", "/api/leads/bulk-assign", {
        leadIds: selectedLeads,
        assignedTo: parseInt(values.assignedTo),
        notes: values.notes,
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to assign leads");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate leads queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      
      // Show success toast
      toast({
        title: "Leads assigned successfully",
        description: `${selectedLeads.length} lead(s) have been assigned`,
      });
      
      // Close the modal
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to assign leads",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: AssignFormValues) => {
    assignMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Leads</DialogTitle>
        </DialogHeader>
        
        <div className="py-2">
          <div className="text-sm text-muted-foreground">
            Assigning {selectedLeads.length} lead(s) to a user
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users?.map((user: any) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.fullName} ({user.role === 'admin' 
                            ? 'Admin' 
                            : user.role === 'sales_manager' 
                              ? 'Sales Manager' 
                              : 'Sales Executive'
                          })
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add notes about this assignment"
                      {...field}
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
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={assignMutation.isPending || loadingUsers || selectedLeads.length === 0}
              >
                {assignMutation.isPending ? "Assigning..." : "Assign Leads"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

## 4. Lead Details Page with Assignment Actions

Updated Lead Details page with assignment actions for sales managers and admins:

```tsx
// Excerpt from client/src/pages/lead-details-page.tsx

// Add this to the imports
import { 
  UserPlus, 
  UserCheck,
  MoreHorizontal 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

// Add the assignment mutation inside the component
const assignLeadMutation = useMutation({
  mutationFn: async (userId: number) => {
    return await apiRequest("PATCH", `/api/leads/${leadId}/assign`, {
      assignedTo: userId,
    });
  },
  onSuccess: () => {
    toast({
      title: "Lead assigned successfully",
      description: "The lead has been assigned to the selected user",
    });
    queryClient.invalidateQueries({ queryKey: [`/api/leads/${leadId}`] });
  },
  onError: (error) => {
    toast({
      title: "Failed to assign lead",
      description: (error as Error).message,
      variant: "destructive",
    });
  },
});

// Add user query
const { data: users } = useQuery({
  queryKey: ["/api/users"],
  enabled: user?.role === 'admin' || user?.role === 'sales_manager'
});

// In the JSX section of the component, add this near other action buttons
{(user?.role === 'admin' || user?.role === 'sales_manager') && (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button size="sm" variant="outline">
        <UserPlus className="mr-2 h-4 w-4" />
        Assign
        <MoreHorizontal className="ml-2 h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>Assign to User</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {users?.map((assignUser: any) => (
        <DropdownMenuItem
          key={assignUser.id}
          onClick={() => assignLeadMutation.mutate(assignUser.id)}
          disabled={assignLeadMutation.isPending}
        >
          {assignUser.fullName}
          {lead.assignedTo === assignUser.id && (
            <UserCheck className="ml-auto h-4 w-4 text-green-500" />
          )}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
)}

// Add this section to display the assigned user information
<div>
  <div className="text-sm font-medium text-slate-500 mb-1">Assigned To</div>
  <div className="flex items-center">
    <div className="bg-primary-100 text-primary-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
      {lead.assignedTo ? (
        users?.find((u: any) => u.id === lead.assignedTo)?.fullName.substring(0, 2) || '??'
      ) : (
        'NA'
      )}
    </div>
    <div className="ml-2">
      {lead.assignedTo ? (
        <span className="text-sm font-medium">
          {users?.find((u: any) => u.id === lead.assignedTo)?.fullName || 'Unknown User'}
        </span>
      ) : (
        <span className="text-sm text-slate-500">Not Assigned</span>
      )}
    </div>
  </div>
</div>
```

## 5. Backend Permission Middleware

Middleware to ensure only authorized users can perform assignment actions:

```typescript
// server/middleware/auth-middleware.ts

export const canAssignLeadsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (req.user.role !== 'admin' && req.user.role !== 'sales_manager') {
    return res.status(403).json({ error: 'Permission denied' });
  }
  
  next();
};

export const canViewAssignedItemsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Set a flag on the request object to indicate if the user can view all items
  // or just their own assigned items
  req.canViewAll = req.user.role === 'admin' || req.user.role === 'sales_manager';
  
  next();
};
```

## 6. Database Relation Schema

Database schema relations for assignment support:

```typescript
// shared/schema.ts (relations section)

// Set up relations between models
export const userRelations = relations(users, ({ many }) => ({
  assignedLeads: many(leads, { relationName: "assignedLeads" }),
  assignedOpportunities: many(opportunities, { relationName: "assignedOpportunities" }),
  assignedTasks: many(tasks, { relationName: "assignedTasks" }),
  createdCompanies: many(companies, { relationName: "companyCreator" }),
  createdContacts: many(contacts, { relationName: "contactCreator" }),
  createdLeads: many(leads, { relationName: "leadCreator" }),
  createdOpportunities: many(opportunities, { relationName: "opportunityCreator" }),
  createdProducts: many(products, { relationName: "productCreator" }),
  createdQuotations: many(quotations, { relationName: "quotationCreator" }),
  createdSalesOrders: many(salesOrders, { relationName: "salesOrderCreator" }),
  createdTasks: many(tasks, { relationName: "taskCreator" }),
  createdActivities: many(activities, { relationName: "activityCreator" }),
}));

export const leadRelations = relations(leads, ({ one }) => ({
  assignedUser: one(users, {
    fields: [leads.assignedTo],
    references: [users.id],
    relationName: "assignedLeads",
  }),
  creator: one(users, {
    fields: [leads.createdBy],
    references: [users.id],
    relationName: "leadCreator",
  }),
}));

export const opportunityRelations = relations(opportunities, ({ one }) => ({
  assignedUser: one(users, {
    fields: [opportunities.assignedTo],
    references: [users.id],
    relationName: "assignedOpportunities",
  }),
  creator: one(users, {
    fields: [opportunities.createdBy],
    references: [users.id],
    relationName: "opportunityCreator",
  }),
  contact: one(contacts, {
    fields: [opportunities.contactId],
    references: [contacts.id],
  }),
  company: one(companies, {
    fields: [opportunities.companyId],
    references: [companies.id],
  }),
  lead: one(leads, {
    fields: [opportunities.leadId],
    references: [leads.id],
  }),
}));
```