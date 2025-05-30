import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUsers } from "@/hooks/use-users";
import { useCompanies } from "@/hooks/use-companies";
import { Loader2 } from "lucide-react";

interface BasicLeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
}

export function BasicLeadForm({ open, onOpenChange, onSubmit, initialData = {}, isLoading = false }: BasicLeadFormProps) {
  const { users, isLoading: usersLoading } = useUsers();
  const { companies, isLoading: companiesLoading } = useCompanies();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyId: "",
    source: "",
    notes: "",
    assignedTo: "",
    status: "new",
  });

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      if (initialData?.id) {
        // Editing mode
        setFormData({
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
        setFormData({
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
  }, [open, initialData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submission started with data:", formData);
    
    if (!formData.name.trim()) {
      alert("Lead name is required");
      return;
    }

    const submissionData = {
      ...formData,
      companyId: formData.companyId && formData.companyId !== "none" ? Number(formData.companyId) : null,
      assignedTo: formData.assignedTo && formData.assignedTo !== "unassigned" ? Number(formData.assignedTo) : null,
    };
    
    console.log("Submitting lead data:", submissionData);
    onSubmit(submissionData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? "Edit Lead" : "Create New Lead"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Lead Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter lead name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Lead Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Lead Phone</Label>
            <Input
              id="phone"
              type="text"
              placeholder="9876543210"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Select
              value={formData.companyId}
              onValueChange={(value) => handleInputChange("companyId", value)}
              disabled={isLoading || companiesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Company</SelectItem>
                {companies?.map((company: any) => (
                  <SelectItem key={company.id} value={String(company.id)}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              type="text"
              placeholder="e.g., website, referral, cold call"
              value={formData.source}
              onChange={(e) => handleInputChange("source", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assigned To</Label>
            <Select
              value={formData.assignedTo}
              onValueChange={(value) => handleInputChange("assignedTo", value)}
              disabled={isLoading || usersLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users?.map((user: any) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              disabled={isLoading}
            />
          </div>

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
      </DialogContent>
    </Dialog>
  );
}