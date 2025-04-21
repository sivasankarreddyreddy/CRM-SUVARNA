import React, { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { OpportunityForm } from "@/components/opportunities/opportunity-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function OpportunityCreatePage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const leadId = params.get("leadId") ? parseInt(params.get("leadId")!) : null;
  
  const [isFormOpen, setIsFormOpen] = useState(true);

  // Get lead data if converting from a lead
  const { data: lead, isLoading: isLoadingLead } = useQuery({
    queryKey: ["/api/leads", leadId],
    enabled: !!leadId,
  });

  // Handle form close
  const handleClose = () => {
    setIsFormOpen(false);
    navigate("/opportunities");
  };

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
                <div className="text-center py-8">
                  <p>Please use the form to {leadId ? "convert this lead" : "create a new opportunity"}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Opportunity Form */}
        <OpportunityForm 
          isOpen={isFormOpen}
          onClose={handleClose}
          leadId={leadId}
        />
      </div>
    </DashboardLayout>
  );
}