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
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<number | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch companies
  const { data: companies, isLoading } = useQuery({
    queryKey: ["/api/companies"],
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

  // Default companies for initial rendering
  const defaultCompanies = [
    { id: 1, name: "Acme Corp", industry: "Technology", website: "www.acmecorp.com", phone: "555-123-4567", address: "123 Main St, New York, NY" },
    { id: 2, name: "TechGiant Inc", industry: "Software", website: "www.techgiant.com", phone: "555-987-6543", address: "456 Tech Blvd, San Francisco, CA" },
    { id: 3, name: "SecureData LLC", industry: "Cybersecurity", website: "www.securedata.com", phone: "555-456-7890", address: "789 Security Ave, Austin, TX" },
    { id: 4, name: "DigiFuture Co", industry: "Digital Marketing", website: "www.digifuture.com", phone: "555-789-0123", address: "321 Digital Dr, Chicago, IL" },
    { id: 5, name: "GlobalTech Inc", industry: "Hardware", website: "www.globaltech.com", phone: "555-234-5678", address: "654 Global Way, Seattle, WA" },
  ];

  // Filter companies based on search query
  const filteredCompanies = companies
    ? companies.filter(
        (company: any) =>
          company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (company.industry && company.industry.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : defaultCompanies.filter(
        (company) =>
          company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (company.industry && company.industry.toLowerCase().includes(searchQuery.toLowerCase()))
      );

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
            <Button variant="outline" className="inline-flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="inline-flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
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

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <Input
              type="text"
              placeholder="Search companies by name or industry..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                        <Building className="h-4 w-4" />
                      </div>
                      {company.name}
                    </div>
                  </TableCell>
                  <TableCell>{company.industry || "-"}</TableCell>
                  <TableCell>
                    {company.website ? (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-slate-400 mr-1" />
                        <a 
                          href={`https://${company.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline"
                        >
                          {company.website}
                        </a>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{company.phone || "-"}</TableCell>
                  <TableCell className="truncate max-w-[200px]">{company.address || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/companies/${company.id}`)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(company)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate(`/contacts?companyId=${company.id}`)}>
                          View Contacts
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/opportunities?companyId=${company.id}`)}>
                          View Opportunities
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(company.id)}
                          className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
