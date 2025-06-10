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
import { DataTable } from "@/components/common/data-table";
import { DataFilterBar } from "@/components/common/data-filter-bar";
import { useDataFilters } from "@/hooks/use-data-filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, MoreVertical, Search, Filter, Download, Mail, Phone, User } from "lucide-react";

export default function ContactsPage() {
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [editContact, setEditContact] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Data filtering, sorting, and pagination
  const {
    search,
    setSearch,
    dateRange,
    setDateRange,
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort,
    resetFilters,
    buildQueryString
  } = useDataFilters();

  // Fetch contacts with filtering, sorting, and pagination
  const { data: contactsData, isLoading, refetch } = useQuery({
    queryKey: ["/api/contacts", search, dateRange, page, pageSize, sort],
    queryFn: () => {
      const queryString = buildQueryString({
        page,
        pageSize,
        search,
        fromDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
        toDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
        column: sort?.column || "createdAt",
        direction: sort?.direction || "desc"
      });
      return fetch(`/api/contacts${queryString}`).then(res => {
        if (!res.ok) throw new Error("Failed to fetch contacts");
        return res.json();
      });
    }
  });
  
  // Fetch companies for dropdown
  const { data: companies } = useQuery({
    queryKey: ["/api/companies"],
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/contacts", {
        ...data,
        createdBy: user?.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Success",
        description: "Contact created successfully",
      });
      setContactFormOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create contact: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/contacts/${data.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Success",
        description: "Contact updated successfully",
      });
      setContactFormOpen(false);
      setIsEditMode(false);
      setEditContact(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update contact: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/contacts/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete contact");
      }
      return res.status === 204 ? null : await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setContactToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      setContactToDelete(null);
    },
  });

  // Handler functions
  const handleNewContact = (data: any) => {
    createContactMutation.mutate(data);
  };

  const handleEdit = (contact: any) => {
    setEditContact(contact);
    setIsEditMode(true);
    setContactFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setContactToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (contactToDelete) {
      deleteContactMutation.mutate(contactToDelete);
    }
  };

  const handleCreateOpportunity = (contact: any) => {
    navigate(`/opportunities/new?contactId=${contact.id}`);
    toast({
      title: "Creating opportunity",
      description: "Please fill in the opportunity details",
    });
  };

  const handleLogActivity = (contact: any) => {
    navigate(`/activities/new?contactId=${contact.id}&relatedTo=contact`);
    toast({
      title: "Logging activity",
      description: "Please fill in the activity details",
    });
  };

  const handleAddTask = (contact: any) => {
    navigate(`/tasks/new?contactId=${contact.id}&relatedTo=contact`);
    toast({
      title: "Adding task",
      description: "Please fill in the task details",
    });
  };

  // Setup data table columns
  const columns = [
    { 
      id: "name",
      header: "Name",
      cell: (contact: any) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
            <User className="h-4 w-4" />
          </div>
          {`${contact.firstName} ${contact.lastName}`}
        </div>
      ),
      sortable: true,
    },
    { 
      id: "title",
      header: "Title",
      cell: (contact: any) => contact.title || "-",
      sortable: true,
    },
    { 
      id: "companyName",
      header: "Company",
      cell: (contact: any) => contact.companyName || "-",
      sortable: true,
    },
    { 
      id: "email",
      header: "Email",
      cell: (contact: any) => (
        contact.email ? (
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-slate-400 mr-1" />
            <a 
              href={`mailto:${contact.email}`} 
              className="text-primary-600 hover:underline"
            >
              {contact.email}
            </a>
          </div>
        ) : (
          "-"
        )
      ),
    },
    { 
      id: "phone",
      header: "Phone",
      cell: (contact: any) => (
        contact.phone ? (
          <div className="flex items-center">
            <Phone className="h-4 w-4 text-slate-400 mr-1" />
            <span>{contact.phone}</span>
          </div>
        ) : (
          "-"
        )
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (contact: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate(`/contacts/${contact.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(contact)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleCreateOpportunity(contact)}>
              Create Opportunity
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLogActivity(contact)}>
              Log Activity
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddTask(contact)}>
              Add Task
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleDelete(contact.id)}
              className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  
  // Format data for display
  const contacts = contactsData?.data || [];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Contacts</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your customer contacts and interactions</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button 
              onClick={() => {
                setIsEditMode(false);
                setEditContact(null);
                setContactFormOpen(true);
              }}
              className="inline-flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
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
          entityName="Contacts"
        />

        {/* Contacts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <DataTable
            data={contacts}
            columns={columns}
            onSortingChange={(newSorting: any) => {
              if (newSorting.length > 0) {
                setSort({
                  column: newSorting[0].id,
                  direction: newSorting[0].desc ? "desc" : "asc",
                });
              }
            }}
            pagination={{
              currentPage: page,
              pageSize: pageSize,
              totalCount: contactsData?.totalCount || 0,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Contact Form Modal */}
      {contactFormOpen && (
        <AlertDialog open={contactFormOpen} onOpenChange={setContactFormOpen}>
          <AlertDialogContent className="sm:max-w-[500px]">
            <AlertDialogHeader>
              <AlertDialogTitle>{isEditMode ? 'Edit Contact' : 'Add New Contact'}</AlertDialogTitle>
            </AlertDialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const companyId = formData.get('companyId') as string;
              const contactData = {
                firstName: formData.get('firstName') as string,
                lastName: formData.get('lastName') as string,
                title: formData.get('title') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                companyId: companyId && companyId !== "null" ? parseInt(companyId, 10) : null
              };
              
              if (!contactData.firstName || !contactData.lastName) {
                toast({
                  title: "Error",
                  description: "First name and last name are required",
                  variant: "destructive",
                });
                return;
              }
              
              if (isEditMode && editContact) {
                updateContactMutation.mutate({
                  ...contactData,
                  id: editContact.id
                });
              } else {
                createContactMutation.mutate(contactData);
              }
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="firstName" className="text-sm font-medium">First Name *</label>
                    <Input 
                      id="firstName"
                      name="firstName"
                      defaultValue={editContact?.firstName || ""}
                      placeholder="First name" 
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="lastName" className="text-sm font-medium">Last Name *</label>
                    <Input 
                      id="lastName"
                      name="lastName"
                      defaultValue={editContact?.lastName || ""}
                      placeholder="Last name" 
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="title" className="text-sm font-medium">Job Title</label>
                  <Input 
                    id="title"
                    name="title"
                    defaultValue={editContact?.title || ""}
                    placeholder="Job title" 
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editContact?.email || ""}
                    placeholder="Email address" 
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                  <Input 
                    id="phone"
                    name="phone"
                    defaultValue={editContact?.phone || ""}
                    placeholder="Phone number" 
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="companyId" className="text-sm font-medium">Company</label>
                  <Select 
                    name="companyId" 
                    defaultValue={editContact?.companyId?.toString() || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">None</SelectItem>
                      {Array.isArray(companies) 
                        ? companies.map((company) => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              {company.name}
                            </SelectItem>
                          )) 
                        : null}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                <Button type="submit" disabled={createContactMutation.isPending || updateContactMutation.isPending}>
                  {createContactMutation.isPending || updateContactMutation.isPending ? 
                    (isEditMode ? 'Updating...' : 'Adding...') : 
                    (isEditMode ? 'Update Contact' : 'Add Contact')}
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
              This action cannot be undone. This will permanently delete the contact and all associated data.
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
