import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define the opportunity schema
const opportunitySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  companyId: z.string().min(1, { message: "Company is required" }),
  value: z.string().min(1, { message: "Value is required" }),
  stage: z.string().min(1, { message: "Stage is required" }),
  probability: z.string(),
  expectedCloseDate: z.string().min(1, { message: "Expected close date is required" }),
  notes: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  leadId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof opportunitySchema>;

interface OpportunityFormProps {
  initialData?: any;
  onSubmit: (data: FormValues) => void;
  isSubmitting?: boolean;
  isEditMode?: boolean;
}

export function OpportunityFormSimple({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  isEditMode = false,
}: OpportunityFormProps) {
  const { user } = useAuth();
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");

  console.log("OpportunityFormSimple initialData:", JSON.stringify(initialData, null, 2));

  // Fetch necessary data for the form
  const { data: companies = [] } = useQuery({ queryKey: ["/api/companies"] });
  const { data: contacts = [] } = useQuery({ queryKey: ["/api/contacts"] });
  const { data: users = [] } = useQuery({ queryKey: ["/api/users"] });
  const { data: leads = [] } = useQuery({ queryKey: ["/api/leads"] });

  const form = useForm<FormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      name: "",
      companyId: "",
      value: "",
      stage: "qualification",
      probability: "30",
      expectedCloseDate: format(new Date(), "yyyy-MM-dd"),
      notes: "",
      assignedTo: user?.id.toString() || "",
      leadId: "",
      contactId: "",
    },
  });

  // Populate form when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      console.log("Setting form values with initialData:", initialData);
      
      const formValues: Partial<FormValues> = {
        name: initialData.name || "",
        stage: initialData.stage || "qualification",
        value: initialData.value || "",
        probability: initialData.probability ? initialData.probability.toString() : "30",
        expectedCloseDate: initialData.expectedCloseDate 
          ? format(new Date(initialData.expectedCloseDate), "yyyy-MM-dd") 
          : format(new Date(), "yyyy-MM-dd"),
        notes: initialData.notes || "",
        assignedTo: initialData.assignedTo ? initialData.assignedTo.toString() : user?.id.toString() || "",
      };

      // Handle company information directly - prioritize company object if available
      if (initialData.company && initialData.company.id) {
        formValues.companyId = initialData.company.id.toString();
        console.log("Setting companyId from company object:", formValues.companyId);
      } else if (initialData.companyId) {
        formValues.companyId = initialData.companyId.toString();
        console.log("Setting companyId from companyId field:", formValues.companyId);
      }

      // Handle contact information
      if (initialData.contact && initialData.contact.id) {
        formValues.contactId = initialData.contact.id.toString();
      } else if (initialData.contactId) {
        formValues.contactId = initialData.contactId.toString();
      }

      // Handle lead information
      if (initialData.lead && initialData.lead.id) {
        formValues.leadId = initialData.lead.id.toString();
        setSelectedLeadId(initialData.lead.id.toString());
      } else if (initialData.leadId) {
        formValues.leadId = initialData.leadId.toString();
        setSelectedLeadId(initialData.leadId.toString());
      }

      form.reset(formValues);
    }
  }, [initialData, form, user]);

  // Determine the lead's company when a lead is selected
  useEffect(() => {
    if (selectedLeadId && leads.length > 0) {
      const selectedLead = leads.find(lead => lead.id.toString() === selectedLeadId);
      if (selectedLead && selectedLead.companyId) {
        form.setValue("companyId", selectedLead.companyId.toString());
      }
    }
  }, [selectedLeadId, leads, form]);

  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    console.log("Form values to submit:", values);
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Opportunity Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opportunity Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter opportunity name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Value */}
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter value" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company */}
          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companies.map(company => (
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

          {/* Lead */}
          <FormField
            control={form.control}
            name="leadId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedLeadId(value);
                  }}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a lead" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {leads.map(lead => (
                      <SelectItem key={lead.id} value={String(lead.id)}>
                        {lead.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stage */}
          <FormField
            control={form.control}
            name="stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stage *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="qualification">Qualification</SelectItem>
                    <SelectItem value="needs_analysis">Needs Analysis</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed_won">Closed Won</SelectItem>
                    <SelectItem value="closed_lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Probability */}
          <FormField
            control={form.control}
            name="probability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Probability (%)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select probability" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="70">70%</SelectItem>
                    <SelectItem value="90">90%</SelectItem>
                    <SelectItem value="100">100%</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Expected Close Date */}
          <FormField
            control={form.control}
            name="expectedCloseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Close Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact */}
          <FormField
            control={form.control}
            name="contactId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a contact" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {contacts.map(contact => (
                      <SelectItem key={contact.id} value={String(contact.id)}>
                        {contact.firstName} {contact.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Assigned To */}
          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned To</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.fullName || user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add more details about this opportunity" 
                  className="min-h-32"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Update Opportunity" : "Create Opportunity"}
          </Button>
        </div>
      </form>
    </Form>
  );
}