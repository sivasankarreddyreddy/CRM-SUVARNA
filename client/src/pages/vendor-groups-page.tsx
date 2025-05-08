import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { VendorGroup } from "@shared/schema";
import { VendorGroupFormDialog } from "@/components/vendor-groups/vendor-group-form-dialog";
import { VendorGroupFormValues } from "@/components/vendor-groups/vendor-group-form";
import { MoreHorizontal, Edit, Trash2, Plus } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

export default function VendorGroupsPage() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editVendorGroup, setEditVendorGroup] = useState<VendorGroup | null>(null);
  const [deleteVendorGroup, setDeleteVendorGroup] = useState<VendorGroup | null>(null);

  // Fetch vendor groups
  const { data: vendorGroups = [], isLoading } = useQuery<VendorGroup[]>({
    queryKey: ["/api/vendor-groups"],
    enabled: true,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: VendorGroupFormValues) => {
      const res = await apiRequest("POST", "/api/vendor-groups", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-groups"] });
      toast({
        title: "Vendor Group Created",
        description: "Vendor group has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create vendor group",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: VendorGroupFormValues }) => {
      const res = await apiRequest("PATCH", `/api/vendor-groups/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-groups"] });
      toast({
        title: "Vendor Group Updated",
        description: "Vendor group has been updated successfully",
      });
      setEditVendorGroup(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update vendor group",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/vendor-groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-groups"] });
      toast({
        title: "Vendor Group Deleted",
        description: "Vendor group has been deleted successfully",
      });
      setDeleteVendorGroup(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete vendor group",
        variant: "destructive",
      });
    },
  });

  const handleCreateSubmit = (data: VendorGroupFormValues) => {
    createMutation.mutate(data);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateSubmit = (data: VendorGroupFormValues) => {
    if (editVendorGroup) {
      updateMutation.mutate({ id: editVendorGroup.id, data });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteVendorGroup) {
      deleteMutation.mutate(deleteVendorGroup.id);
    }
  };

  const isLoaderShowing = isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Vendor Group Master</CardTitle>
            <CardDescription>
              Manage vendor groups for categorizing healthcare equipment vendors
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor Group
          </Button>
        </CardHeader>
        <CardContent>
          {isLoaderShowing ? (
            <div className="flex justify-center my-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : vendorGroups.length === 0 ? (
            <div className="text-center my-8 text-muted-foreground">
              No vendor groups found. Create your first vendor group to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorGroups.map((vendorGroup) => (
                  <TableRow key={vendorGroup.id}>
                    <TableCell className="font-medium">{vendorGroup.name}</TableCell>
                    <TableCell>{vendorGroup.description || "-"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setEditVendorGroup(vendorGroup)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteVendorGroup(vendorGroup)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <VendorGroupFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSubmit}
        title="Create Vendor Group"
      />

      {/* Edit Dialog */}
      {editVendorGroup && (
        <VendorGroupFormDialog
          open={!!editVendorGroup}
          onOpenChange={(open) => !open && setEditVendorGroup(null)}
          initialData={editVendorGroup}
          onSubmit={handleUpdateSubmit}
          title="Edit Vendor Group"
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteVendorGroup}
        onOpenChange={(open) => !open && setDeleteVendorGroup(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the vendor group "{deleteVendorGroup?.name}"? 
              This action cannot be undone and may affect vendors currently assigned to this group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}