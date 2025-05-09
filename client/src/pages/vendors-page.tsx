import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Search, Filter, Download, Building } from "lucide-react";
import { VendorDetailDialog } from "@/components/vendors/vendor-detail-dialog";
import { VendorFormDialog } from "@/components/vendors/vendor-form-dialog";
import { VendorDeleteDialog } from "@/components/vendors/vendor-delete-dialog";
import { apiRequest } from "@/lib/queryClient";

export default function VendorsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for dialogs
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "duplicate">("create");

  // Fetch vendors
  const { data: vendorsResponse, isLoading, isError } = useQuery({
    queryKey: ["/api/vendors"],
  });
  
  // Extract the data array from the paginated response
  const vendors = vendorsResponse?.data || [];

  // Toggle vendor activation status
  const toggleActivationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest("PATCH", `/api/vendors/${id}`, { isActive });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.isActive ? "Vendor Activated" : "Vendor Deactivated",
        description: `${data.name} has been ${data.isActive ? "activated" : "deactivated"} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: `Failed to update vendor: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle action menu item clicks
  const handleViewDetails = (vendor: any) => {
    setSelectedVendor(vendor);
    setIsDetailDialogOpen(true);
  };

  const handleEdit = (vendor: any) => {
    console.log("Edit button clicked for vendor:", vendor);
    
    // Store just the ID, not the full vendor object
    // This will ensure we fetch fresh data in the form dialog
    setSelectedVendor({ id: vendor.id });
    setFormMode("edit");
    setIsFormDialogOpen(true);
  };

  const handleDuplicate = (vendor: any) => {
    setSelectedVendor(vendor);
    setFormMode("duplicate");
    setIsFormDialogOpen(true);
  };

  const handleToggleActivation = (vendor: any) => {
    toggleActivationMutation.mutate({
      id: vendor.id,
      isActive: !vendor.isActive,
    });
  };

  const handleDelete = (vendor: any) => {
    setSelectedVendor(vendor);
    setIsDeleteDialogOpen(true);
  };

  const handleAddVendor = () => {
    setSelectedVendor(null);
    setFormMode("create");
    setIsFormDialogOpen(true);
  };

  // Filter vendors based on search query
  const filteredVendors = Array.isArray(vendors)
    ? vendors.filter(
        (vendor: any) =>
          vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (vendor.contactPerson && vendor.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (vendor.email && vendor.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Vendors</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your vendor relationships</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button variant="outline" className="inline-flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="inline-flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button className="inline-flex items-center" onClick={handleAddVendor}>
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <Input
              type="text"
              placeholder="Search vendors by name, contact person, or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Vendors Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <LoadingSpinner />
                    <div className="mt-2">Loading vendors...</div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-red-500">
                    Error loading vendors. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredVendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No vendors found. {searchQuery && "Try a different search term."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredVendors.map((vendor: any) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                          <Building className="h-4 w-4" />
                        </div>
                        {vendor.name}
                      </div>
                    </TableCell>
                    <TableCell>{vendor.vendorGroupName || "N/A"}</TableCell>
                    <TableCell>{vendor.contactPerson || "N/A"}</TableCell>
                    <TableCell>{vendor.email || "N/A"}</TableCell>
                    <TableCell>{vendor.phone || "N/A"}</TableCell>
                    <TableCell>
                      {vendor.isActive ? (
                        <Badge variant="won">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(vendor)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(vendor)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleActivation(vendor)}>
                            {vendor.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(vendor)}>
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600" 
                            onClick={() => handleDelete(vendor)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialogs */}
        {selectedVendor && (
          <>
            <VendorDetailDialog 
              vendor={selectedVendor} 
              isOpen={isDetailDialogOpen} 
              onClose={() => setIsDetailDialogOpen(false)} 
            />
            
            <VendorDeleteDialog
              vendorId={selectedVendor.id}
              vendorName={selectedVendor.name}
              isOpen={isDeleteDialogOpen}
              onClose={() => setIsDeleteDialogOpen(false)}
            />
          </>
        )}
        
        <VendorFormDialog 
          initialData={selectedVendor}
          isOpen={isFormDialogOpen} 
          onClose={() => setIsFormDialogOpen(false)}
          mode={formMode}
        />
      </div>
    </DashboardLayout>
  );
}