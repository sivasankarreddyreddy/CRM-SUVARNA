import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { OpportunityForm } from "@/components/opportunities/opportunity-form";
import { z } from "zod";

const opportunitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  stage: z.string().min(1, "Stage is required"),
  value: z.string().optional(),
  closingDate: z.string().optional(),
  probability: z.string().optional(),
  description: z.string().optional(),
  leadId: z.number().optional(),
  assignedTo: z.number().optional(),
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
    // TanStack Query v5 doesn't support onSuccess and onError options in useQuery directly
    // Moving these handlers to the appropriate useEffect
  });
  
  // Handle success and error cases with useEffect
  useEffect(() => {
    if (opportunity) {
      console.log("Loaded opportunity with company data:", JSON.stringify(opportunity, null, 2));
      
      // Debugging the company data structure to help with form population
      if (opportunity.companyId) {
        console.log("Company ID in opportunity:", opportunity.companyId);
      }
      
      if (opportunity.company) {
        console.log("Company object in opportunity:", JSON.stringify(opportunity.company, null, 2));
      }
    }
  }, [opportunity]);
  
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
      const res = await apiRequest("PATCH", `/api/opportunities/${id}`, values);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update opportunity");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/opportunities/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      toast({
        title: "Opportunity updated",
        description: "The opportunity has been successfully updated.",
      });
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

        {/* Opportunity Form */}
        <Card className="p-6">
          <OpportunityForm
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