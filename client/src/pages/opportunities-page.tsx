import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Plus, MoreVertical, Search, Filter, Download } from "lucide-react";

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch opportunities
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ["/api/opportunities"],
  });

  // Default opportunities for initial rendering
  const defaultOpportunities = [
    { id: 1, name: "Cloud Migration Service", company: "Acme Corp", stage: "qualification", value: "$12,500", probability: 30, expectedCloseDate: "2023-08-15" },
    { id: 2, name: "ERP Implementation", company: "TechGiant Inc", stage: "negotiation", value: "$45,000", probability: 70, expectedCloseDate: "2023-08-30" },
    { id: 3, name: "Security Assessment", company: "SecureData LLC", stage: "closing", value: "$8,750", probability: 90, expectedCloseDate: "2023-07-31" },
    { id: 4, name: "Digital Marketing Campaign", company: "DigiFuture Co", stage: "proposal", value: "$18,300", probability: 50, expectedCloseDate: "2023-09-15" },
    { id: 5, name: "Hardware Upgrade", company: "GlobalTech Inc", stage: "won", value: "$27,500", probability: 100, expectedCloseDate: "2023-07-10" },
    { id: 6, name: "Mobile App Development", company: "MobiSoft", stage: "lost", value: "$35,200", probability: 0, expectedCloseDate: "2023-07-05" },
  ];

  // Filter opportunities based on search query
  const filteredOpportunities = opportunities
    ? opportunities.filter(
        (opportunity: any) =>
          opportunity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (opportunity.company && opportunity.company.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : defaultOpportunities.filter(
        (opportunity) =>
          opportunity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (opportunity.company && opportunity.company.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Opportunities</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your sales pipeline and track deal progress</p>
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
              Add Opportunity
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <Input
              type="text"
              placeholder="Search opportunities by name or company..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Opportunities Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Expected Close</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOpportunities.map((opportunity) => (
                <TableRow key={opportunity.id}>
                  <TableCell className="font-medium">{opportunity.name}</TableCell>
                  <TableCell>{opportunity.company}</TableCell>
                  <TableCell>
                    <Badge variant={opportunity.stage}>
                      {opportunity.stage.charAt(0).toUpperCase() + opportunity.stage.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{opportunity.value}</TableCell>
                  <TableCell>{opportunity.probability}%</TableCell>
                  <TableCell>{new Date(opportunity.expectedCloseDate).toLocaleDateString()}</TableCell>
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
                        <DropdownMenuItem>Create Quotation</DropdownMenuItem>
                        <DropdownMenuItem>Convert to Sale</DropdownMenuItem>
                        <DropdownMenuItem>Log Activity</DropdownMenuItem>
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
