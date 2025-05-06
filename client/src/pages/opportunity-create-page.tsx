import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { OpportunityFormSimple } from "@/components/opportunities/opportunity-form-simple";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Define schema for form values
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

type OpportunityFormValues = z.infer<typeof opportunitySchema>;

export default function OpportunityCreatePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const leadId = params.get("leadId") ? parseInt(params.get("leadId")!) : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get lead data if converting from a lead
  const { data: lead, isLoading: isLoadingLead } = useQuery({
    queryKey: [`/api/leads/${leadId}`],
    enabled: !!leadId,
  });

  // Create opportunity mutation
  const createOpportunityMutation = useMutation({
    mutationFn: async (values: OpportunityFormValues) => {
      setIsSubmitting(true);
      console.log("Creating opportunity with values:", values);
      
      // Convert string values to appropriate types
      const processedValues = {
        ...values,
        companyId: values.companyId ? parseInt(values.companyId) : undefined,
        contactId: values.contactId ? parseInt(values.contactId) : null,
        leadId: values.leadId ? parseInt(values.leadId) : null,
        assignedTo: values.assignedTo ? parseInt(values.assignedTo) : null,
        probability: values.probability ? parseInt(values.probability) : null,
      };
      
      const res = await apiRequest("POST", "/api/opportunities", processedValues);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create opportunity");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      
      toast({
        title: "Opportunity created",
        description: "The opportunity has been successfully created.",
      });
      
      // Navigate to the new opportunity details page
      navigate(`/opportunities/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating opportunity",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: OpportunityFormValues) => {
    createOpportunityMutation.mutate(data);
  };

  // Prepare initial data if converting from lead
  const initialData = leadId && lead ? {
    name: lead.name || "",
    companyId: lead.companyId || "",
    leadId: leadId.toString(),
    // Add other fields from lead as needed
  } : {};

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate("/opportunities")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Opportunities
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{leadId ? "Convert Lead to Opportunity" : "Create New Opportunity"}</CardTitle>
              <CardDescription>
                {leadId 
                  ? "Convert this lead into a new sales opportunity"
                  : "Add a new sales opportunity to your pipeline"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLead && leadId ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse">Loading lead data...</div>
                </div>
              ) : (
                <OpportunityFormSimple
                  initialData={initialData}
                  onSubmit={onSubmit}
                  isSubmitting={isSubmitting}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}