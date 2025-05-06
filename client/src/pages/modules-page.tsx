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
import { Plus, MoreVertical, Search, Filter, Download, Box } from "lucide-react";
import { ModuleDetailDialog } from "@/components/modules/module-detail-dialog";
import { ModuleFormDialog } from "@/components/modules/module-form-dialog";
import { ModuleDeleteDialog } from "@/components/modules/module-delete-dialog";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";

export default function ModulesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for dialogs
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "duplicate">("create");

  // Fetch modules
  const { data: modules, isLoading, isError } = useQuery({
    queryKey: ["/api/modules"],
  });

  // Toggle module activation status
  const toggleActivationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest("PATCH", `/api/modules/${id}`, { isActive });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.isActive ? "Module Activated" : "Module Deactivated",
        description: `${data.name} has been ${data.isActive ? "activated" : "deactivated"} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: `Failed to update module: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle action menu item clicks
  const handleViewDetails = (module: any) => {
    setSelectedModule(module);
    setIsDetailDialogOpen(true);
  };

  const handleEdit = (module: any) => {
    setSelectedModule(module);
    setFormMode("edit");
    setIsFormDialogOpen(true);
  };

  const handleDuplicate = (module: any) => {
    setSelectedModule(module);
    setFormMode("duplicate");
    setIsFormDialogOpen(true);
  };

  const handleToggleActivation = (module: any) => {
    toggleActivationMutation.mutate({
      id: module.id,
      isActive: !module.isActive,
    });
  };

  const handleDelete = (module: any) => {
    setSelectedModule(module);
    setIsDeleteDialogOpen(true);
  };

  const handleAddModule = () => {
    setSelectedModule(null);
    setFormMode("create");
    setIsFormDialogOpen(true);
  };

  // Filter modules based on search query
  const filteredModules = modules
    ? modules.filter(
        (module: any) =>
          module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (module.description && module.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Product Modules</h1>
            <p className="mt-1 text-sm text-slate-500">Manage modules that can be added to products</p>
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
            <Button className="inline-flex items-center" onClick={handleAddModule}>
              <Plus className="mr-2 h-4 w-4" />
              Add Module
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <Input
              type="text"
              placeholder="Search modules by name or description..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Modules Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <LoadingSpinner />
                    <div className="mt-2">Loading modules...</div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-red-500">
                    Error loading modules. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredModules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No modules found. {searchQuery && "Try a different search term."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredModules.map((module: any) => (
                  <TableRow key={module.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                          <Box className="h-4 w-4" />
                        </div>
                        {module.name}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{module.description || "N/A"}</TableCell>
                    <TableCell>₹{formatCurrency(module.price)}</TableCell>
                    <TableCell>
                      {module.isActive ? (
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
                          <DropdownMenuItem onClick={() => handleViewDetails(module)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(module)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleActivation(module)}>
                            {module.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(module)}>
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600" 
                            onClick={() => handleDelete(module)}
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
        {selectedModule && (
          <>
            <ModuleDetailDialog 
              module={selectedModule} 
              isOpen={isDetailDialogOpen} 
              onClose={() => setIsDetailDialogOpen(false)} 
            />
            
            <ModuleDeleteDialog
              moduleId={selectedModule.id}
              moduleName={selectedModule.name}
              isOpen={isDeleteDialogOpen}
              onClose={() => setIsDeleteDialogOpen(false)}
            />
          </>
        )}
        
        <ModuleFormDialog 
          initialData={selectedModule}
          isOpen={isFormDialogOpen} 
          onClose={() => setIsFormDialogOpen(false)}
          mode={formMode}
        />
      </div>
    </DashboardLayout>
  );
}