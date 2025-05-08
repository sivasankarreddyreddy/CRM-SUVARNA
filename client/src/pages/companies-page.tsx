import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DataFilterBar } from "@/components/common/data-filter-bar";
import { DataTable } from "@/components/common/data-table";
import { useDataFilters } from "@/hooks/use-data-filters";
import { DateRange } from "react-day-picker";
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
import { Plus, MoreVertical, Search, Filter, Download, Globe, Building } from "lucide-react";

export default function CompaniesPage() {
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<number | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Use data filters hook for pagination, sorting, and filtering
  const {
    page,
    pageSize,
    sort,
    search,
    dateRange,
    setPage,
    setPageSize,
    setSort,
    setSearch,
    setDateRange,
    resetFilters,
    buildQueryString,
  } = useDataFilters({
    defaultSort: { column: "createdAt", direction: "desc" },
  });

  // Fetch companies with filtering, pagination, and sorting
  const {
    data: companiesData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["/api/companies", page, pageSize, sort, search, dateRange],
    queryFn: () => {
      const queryString = buildQueryString({
        page,
        pageSize,
        column: sort.column,
        direction: sort.direction,
        search,
        fromDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
        toDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
      });
      return apiRequest("GET", `/api/companies${queryString}`);
    },
  });
  
  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/companies", {
        ...data,
        createdBy: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Success",
        description: "Company created successfully",
      });
      setCompanyFormOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create company: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", `/api/companies/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Success",
        description: "Company updated successfully",
      });
      setCompanyFormOpen(false);
      setIsEditMode(false);
      setEditCompany(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update company: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/companies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setCompanyToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete company: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Handler functions
  const handleNewCompany = (data: any) => {
    createCompanyMutation.mutate(data);
  };

  const handleEdit = (company: any) => {
    setEditCompany(company);
    setIsEditMode(true);
    setCompanyFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setCompanyToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (companyToDelete) {
      deleteCompanyMutation.mutate(companyToDelete);
    }
  };

  // Data table columns config
  const columns = [
    { header: "Name", accessorKey: "name", enableSorting: true },
    { header: "Industry", accessorKey: "industry", enableSorting: true },
    { header: "City", accessorKey: "city", enableSorting: true },
    { header: "Country", accessorKey: "country", enableSorting: true },
  ];

  // Default companies for initial rendering
  const defaultCompanies = [
    { id: 1, name: "Acme Corp", industry: "Technology", website: "www.acmecorp.com", phone: "555-123-4567", address: "123 Main St, New York, NY" },
    { id: 2, name: "TechGiant Inc", industry: "Software", website: "www.techgiant.com", phone: "555-987-6543", address: "456 Tech Blvd, San Francisco, CA" },
    { id: 3, name: "SecureData LLC", industry: "Cybersecurity", website: "www.securedata.com", phone: "555-456-7890", address: "789 Security Ave, Austin, TX" },
    { id: 4, name: "DigiFuture Co", industry: "Digital Marketing", website: "www.digifuture.com", phone: "555-789-0123", address: "321 Digital Dr, Chicago, IL" },
    { id: 5, name: "GlobalTech Inc", industry: "Hardware", website: "www.globaltech.com", phone: "555-234-5678", address: "654 Global Way, Seattle, WA" },
  ];

  // Format data for display
  const companies = companiesData?.data || [];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Companies</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your business accounts and organizations</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button 
              onClick={() => {
                setIsEditMode(false);
                setEditCompany(null);
                setCompanyFormOpen(true);
              }}
              className="inline-flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <DataFilterBar
          onSearchChange={setSearch}
          onDateRangeChange={setDateRange}
          onRefresh={refetch}
          onClearFilters={resetFilters}
          searchValue={search}
          dateRange={dateRange}
          isLoading={isLoading}
          entityName="Companies"
        />

        {/* Companies Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <DataTable
            data={companies}
            columns={[
              {
                header: "Name",
                accessorKey: "name",
                enableSorting: true,
                cell: ({ row }) => (
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                      <Building className="h-4 w-4" />
                    </div>
                    {row.original.name}
                  </div>
                ),
              },
              {
                header: "Industry",
                accessorKey: "industry",
                enableSorting: true,
                cell: ({ row }) => row.original.industry || "-",
              },
              {
                header: "Website",
                accessorKey: "website",
                cell: ({ row }) => (
                  row.original.website ? (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-slate-400 mr-1" />
                      <a 
                        href={`https://${row.original.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        {row.original.website}
                      </a>
                    </div>
                  ) : (
                    "-"
                  )
                ),
              },
              {
                header: "Location",
                accessorKey: "city",
                enableSorting: true,
                cell: ({ row }) => {
                  const location = [
                    row.original.city,
                    row.original.country
                  ].filter(Boolean).join(", ");
                  return location || "-";
                },
              },
              {
                header: "Actions",
                id: "actions",
                cell: ({ row }) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigate(`/companies/${row.original.id}`)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(`/contacts?companyId=${row.original.id}`)}>
                        View Contacts
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/opportunities?companyId=${row.original.id}`)}>
                        View Opportunities
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(row.original.id)}
                        className="text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ),
              },
            ]}
            onSortingChange={(newSorting) => {
              if (newSorting.length > 0) {
                setSort({
                  column: newSorting[0].id,
                  direction: newSorting[0].desc ? "desc" : "asc",
                });
              }
            }}
            pagination={{
              pageIndex: page - 1,
              pageSize,
              pageCount: companiesData?.totalPages || 1,
              totalRecords: companiesData?.totalCount || 0,
              onPageChange: (newPage) => setPage(newPage + 1),
              onPageSizeChange: setPageSize,
            }}
            state={{
              sorting: [
                {
                  id: sort.column,
                  desc: sort.direction === "desc",
                },
              ],
              pagination: {
                pageIndex: page - 1,
                pageSize,
              },
            }}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Company Form Modal */}
      {companyFormOpen && (
        <AlertDialog open={companyFormOpen} onOpenChange={setCompanyFormOpen}>
          <AlertDialogContent className="sm:max-w-[500px]">
            <AlertDialogHeader>
              <AlertDialogTitle>{isEditMode ? 'Edit Company' : 'Add New Company'}</AlertDialogTitle>
            </AlertDialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const companyData = {
                name: formData.get('name') as string,
                industry: formData.get('industry') as string,
                website: formData.get('website') as string,
                phone: formData.get('phone') as string,
                address: formData.get('address') as string,
                requiredSizeOfHospital: formData.get('requiredSizeOfHospital') as string,
                notes: formData.get('notes') as string
              };
              
              if (!companyData.name) {
                toast({
                  title: "Error",
                  description: "Company name is required",
                  variant: "destructive",
                });
                return;
              }
              
              if (isEditMode && editCompany) {
                updateCompanyMutation.mutate({
                  ...companyData,
                  id: editCompany.id
                });
              } else {
                createCompanyMutation.mutate(companyData);
              }
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Company Name *</label>
                  <Input 
                    id="name"
                    name="name"
                    defaultValue={editCompany?.name || ""}
                    placeholder="Company name" 
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="industry" className="text-sm font-medium">Industry</label>
                  <Input 
                    id="industry"
                    name="industry"
                    defaultValue={editCompany?.industry || ""}
                    placeholder="Industry" 
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="website" className="text-sm font-medium">Website</label>
                  <Input 
                    id="website"
                    name="website"
                    defaultValue={editCompany?.website || ""}
                    placeholder="Website (e.g. example.com)" 
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                  <Input 
                    id="phone"
                    name="phone"
                    defaultValue={editCompany?.phone || ""}
                    placeholder="Phone number" 
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="address" className="text-sm font-medium">Address</label>
                  <Input 
                    id="address"
                    name="address"
                    defaultValue={editCompany?.address || ""}
                    placeholder="Address" 
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="requiredSizeOfHospital" className="text-sm font-medium">Required Size of Hospital</label>
                  <Input 
                    id="requiredSizeOfHospital"
                    name="requiredSizeOfHospital"
                    defaultValue={editCompany?.requiredSizeOfHospital || ""}
                    placeholder="e.g. 100-200 beds, 300+ beds" 
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                  <Textarea 
                    id="notes"
                    name="notes"
                    defaultValue={editCompany?.notes || ""}
                    placeholder="Additional information about the company" 
                    rows={3}
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                <Button type="submit" disabled={createCompanyMutation.isPending || updateCompanyMutation.isPending}>
                  {createCompanyMutation.isPending || updateCompanyMutation.isPending ? 
                    (isEditMode ? 'Updating...' : 'Adding...') : 
                    (isEditMode ? 'Update Company' : 'Add Company')}
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the company and may affect related contacts and opportunities.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
