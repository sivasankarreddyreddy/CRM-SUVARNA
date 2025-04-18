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
import { Plus, MoreVertical, Search, Filter, Download, Globe, Building } from "lucide-react";

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch companies
  const { data: companies, isLoading } = useQuery({
    queryKey: ["/api/companies"],
  });

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
            <Button className="inline-flex items-center">
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Contacts</DropdownMenuItem>
                        <DropdownMenuItem>View Opportunities</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
