import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQueryParams } from "@/lib/utils";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import TaskForm from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TaskCreatePage() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/tasks/new");
  const searchParams = new URLSearchParams(window.location.search);
  const [isFormOpen, setIsFormOpen] = useState(true);
  
  // Extract leadId from query parameters if available
  const leadId = searchParams.get("leadId") ? parseInt(searchParams.get("leadId") as string) : undefined;
  const relatedTo = searchParams.get("relatedTo") || "lead";
  
  const handleFormClose = () => {
    setIsFormOpen(false);
    
    // Redirect back to the source page if leadId is available
    if (leadId) {
      navigate(`/leads/${leadId}`);
    } else {
      navigate("/tasks");
    }
  };
  
  // Auto-open the form when the page loads
  useEffect(() => {
    setIsFormOpen(true);
  }, []);
  
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate(leadId ? `/leads/${leadId}` : "/tasks")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {leadId ? "Back to Lead" : "Back to Tasks"}
          </Button>
          <h1 className="text-2xl font-semibold">Create New Task</h1>
        </div>
        
        <TaskForm 
          open={isFormOpen} 
          onOpenChange={handleFormClose} 
          leadId={leadId}
          relatedTo={relatedTo}
        />
      </div>
    </DashboardLayout>
  );
}