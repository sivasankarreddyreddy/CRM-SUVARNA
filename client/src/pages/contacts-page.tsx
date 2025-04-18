import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, MoreVertical, Search, Filter, Download, Mail, Phone } from "lucide-react";

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch contacts
  const { data: contacts, isLoading } = useQuery({
    queryKey: ["/api/contacts"],
  });

  // Default contacts for initial rendering
  const defaultContacts = [
    { id: 1, firstName: "John", lastName: "Smith", title: "CEO", email: "john@acmecorp.com", phone: "555-123-4567", companyName: "Acme Corp" },
    { id: 2, firstName: "Sarah", lastName: "Johnson", title: "CTO", email: "sarah@techgiant.com", phone: "555-987-6543", companyName: "TechGiant Inc" },
    { id: 3, firstName: "Michael", lastName: "Brown", title: "Sales Director", email: "michael@securedata.com", phone: "555-456-7890", companyName: "SecureData LLC" },
    { id: 4, firstName: "Emily", lastName: "Davis", title: "Marketing Manager", email: "emily@digifuture.com", phone: "555-789-0123", companyName: "DigiFuture Co" },
    { id: 5, firstName: "David", lastName: "Wilson", title: "CFO", email: "david@globaltech.com", phone: "555-234-5678", companyName: "GlobalTech Inc" },
  ];

  // Filter contacts based on search query
  const filteredContacts = contacts
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
            <Button className="inline-flex items-center">
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
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Create Opportunity</DropdownMenuItem>
                          <DropdownMenuItem>Log Activity</DropdownMenuItem>
                          <DropdownMenuItem>Add Task</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
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
    </DashboardLayout>
  );
}
