import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { OpportunityFormSimple } from "@/components/opportunities/opportunity-form-simple";
import { z } from "zod";

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

export default function OpportunityEditPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch opportunity details with all related data
  const { data: opportunity, isLoading, isError } = useQuery({
    queryKey: [`/api/opportunities/${id}`],
  });
  
  // Debug log the data received
  useEffect(() => {
    if (opportunity) {
      console.log("OpportunityEditPage: Loaded opportunity data:", JSON.stringify({
        id: opportunity.id,
        name: opportunity.name,
        companyId: opportunity.companyId,
        company: opportunity.company,
        leadId: opportunity.leadId,
        lead: opportunity.lead
      }, null, 2));
    }
  }, [opportunity]);
  
  // Handle error cases
  useEffect(() => {
    if (isError) {
      console.error("Error loading opportunity data");
      toast({
        title: "Error loading opportunity",
        description: "Could not load opportunity details. Please try again.",
        variant: "destructive",
      });
    }
  }, [isError, toast]);

  // Update opportunity mutation
  const updateOpportunityMutation = useMutation({
    mutationFn: async (values: OpportunityFormValues) => {
      setIsSubmitting(true);
      console.log("Submitting opportunity update with values:", values);
      
      // Convert string values to appropriate types
      const processedValues = {
        ...values,
        companyId: values.companyId ? parseInt(values.companyId) : undefined,
        contactId: values.contactId ? parseInt(values.contactId) : null,
        leadId: values.leadId ? parseInt(values.leadId) : null,
        assignedTo: values.assignedTo ? parseInt(values.assignedTo) : null,
        probability: values.probability ? parseInt(values.probability) : null,
      };
      
      const res = await apiRequest("PATCH", `/api/opportunities/${id}`, processedValues);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update opportunity");
      }
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/opportunities/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      
      toast({
        title: "Opportunity updated",
        description: "The opportunity has been successfully updated.",
      });
      
      // Navigate back to the opportunity details page
      navigate(`/opportunities/${id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating opportunity",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: OpportunityFormValues) => {
    updateOpportunityMutation.mutate(data);
  };

  // Display loading skeleton while data is being fetched
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-10 w-1/3 bg-slate-200 rounded mb-4"></div>
          <div className="h-80 bg-slate-200 rounded"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/opportunities/${id}`)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-slate-800">
            Edit Opportunity
          </h1>
        </div>

        {/* Opportunity Form - Using our new simplified form component */}
        <Card className="p-6">
          <OpportunityFormSimple
            initialData={opportunity}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            isEditMode
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}