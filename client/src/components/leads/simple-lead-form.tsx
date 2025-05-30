import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-users";
import { useCompanies } from "@/hooks/use-companies";
import { Loader2 } from "lucide-react";

interface SimpleLeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
}

export function SimpleLeadForm({ open, onOpenChange, onSubmit, initialData = {}, isLoading = false }: SimpleLeadFormProps) {
  const { user } = useAuth();
  const { users } = useUsers();
  const { companies } = useCompanies();
  const canAssignLeads = user?.role === 'admin' || user?.role === 'sales_manager';

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyId: "",
    source: "website",
    notes: "",
    assignedTo: "",
    status: "new"
  });

  // Reset form when dialog opens or closes
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: initialData?.name || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        companyId: initialData?.companyId ? String(initialData.companyId) : "",
        source: initialData?.source || "website",
        notes: initialData?.notes || "",
        assignedTo: initialData?.assignedTo ? String(initialData.assignedTo) : "",
        status: initialData?.status || "new"
      });
    }
  }, [open, initialData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    const submitData = {
      ...formData,
      companyId: formData.companyId && formData.companyId !== "none" ? Number(formData.companyId) : null,
      assignedTo: formData.assignedTo && formData.assignedTo !== "unassigned" ? Number(formData.assignedTo) : null,
      email: formData.email || null,
      phone: formData.phone || null,
      notes: formData.notes || null
    };

    onSubmit(submitData);
  };

  const selectedCompany = companies?.find(c => c.id === Number(formData.companyId));

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
              placeholder="Enter lead name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Lead Phone</Label>
            <Input
              id="phone"
              placeholder="9876543210, 9123456789"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9,]/g, '');
                handleInputChange("phone", value);
              }}
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Select
              value={formData.companyId}
              onValueChange={(value) => handleInputChange("companyId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No company</SelectItem>
                {Array.isArray(companies) && companies.map(company => (
                  <SelectItem key={company.id} value={String(company.id)}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCompany && selectedCompany.phone && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-blue-800">Company Phone:</div>
                <div className="text-sm text-blue-700">{selectedCompany.phone}</div>
              </div>
              {selectedCompany.address && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-sm font-medium text-blue-800">Address:</div>
                  <div className="text-sm text-blue-700">{selectedCompany.address}</div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="source">Lead Source</Label>
            <Select
              value={formData.source}
              onValueChange={(value) => handleInputChange("source", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select lead source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="email">Email Campaign</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional information about this lead"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          {canAssignLeads && (
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) => handleInputChange("assignedTo", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {Array.isArray(users) && users
                    .filter(user => user.role === 'sales_executive' || user.role === 'sales_manager')
                    .map(user => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.fullName} ({user.role === 'sales_executive' ? 'Sales Exec' : 'Sales Manager'})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="mt-6 sm:justify-between">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()} className="min-w-[120px]">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {initialData?.id ? "Saving..." : "Creating..."}
                </>
              ) : (
                initialData?.id ? "Save Changes" : "Create Lead"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}