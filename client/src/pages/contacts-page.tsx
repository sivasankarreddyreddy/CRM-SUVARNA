import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, MoreVertical, Search, Filter, Download, Mail, Phone } from "lucide-react";

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [editContact, setEditContact] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch contacts
  const { data: contacts, isLoading } = useQuery({
    queryKey: ["/api/contacts"],
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/contacts", {
        ...data,
        createdBy: user?.id,
      });
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
      return await apiRequest("PATCH", `/api/contacts/${data.id}`, data);
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
      return await apiRequest("DELETE", `/api/contacts/${id}`);
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
        description: "Failed to delete contact: " + (error as Error).message,
        variant: "destructive",
      });
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

  // Default contacts for initial rendering
  const defaultContacts = [
    { id: 1, firstName: "John", lastName: "Smith", title: "CEO", email: "john@acmecorp.com", phone: "555-123-4567", companyName: "Acme Corp" },
    { id: 2, firstName: "Sarah", lastName: "Johnson", title: "CTO", email: "sarah@techgiant.com", phone: "555-987-6543", companyName: "TechGiant Inc" },
    { id: 3, firstName: "Michael", lastName: "Brown", title: "Sales Director", email: "michael@securedata.com", phone: "555-456-7890", companyName: "SecureData LLC" },
    { id: 4, firstName: "Emily", lastName: "Davis", title: "Marketing Manager", email: "emily@digifuture.com", phone: "555-789-0123", companyName: "DigiFuture Co" },
    { id: 5, firstName: "David", lastName: "Wilson", title: "CFO", email: "david@globaltech.com", phone: "555-234-5678", companyName: "GlobalTech Inc" },
  ];

  // Filter contacts based on search query
  const filteredContacts = contacts && Array.isArray(contacts)
    ? contacts.filter(
        (contact: any) =>
          `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (contact.companyName && contact.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : defaultContacts.filter(
        (contact) =>
          `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (contact.companyName && contact.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );

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
                setEditContact(null);
                setContactFormOpen(true);
              }}
              className="inline-flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <Input
              type="text"
              placeholder="Search contacts by name, company, or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">
                    {contact.firstName} {contact.lastName}
                  </TableCell>
                  <TableCell>{contact.title || "-"}</TableCell>
                  <TableCell>{contact.companyName || "-"}</TableCell>
                  <TableCell>{contact.email || "-"}</TableCell>
                  <TableCell>{contact.phone || "-"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" title="Send Email">
                        <Mail className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Call">
                        <Phone className="h-4 w-4 text-slate-500" />
                      </Button>
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              const contactData = {
                firstName: formData.get('firstName') as string,
                lastName: formData.get('lastName') as string,
                title: formData.get('title') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                companyName: formData.get('companyName') as string
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
                  <label htmlFor="companyName" className="text-sm font-medium">Company</label>
                  <Input 
                    id="companyName"
                    name="companyName"
                    defaultValue={editContact?.companyName || ""}
                    placeholder="Company name" 
                  />
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
