import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MobileLayout } from '@/components/layouts/mobile-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import {
  Plus,
  Search,
  Phone,
  Mail,
  Building,
  User,
  ArrowUpRight,
  AlertCircle,
  Calendar
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';

export default function MobileLeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch leads with pagination
  const { data: leadsResponse, isLoading } = useQuery({
    queryKey: ['/api/leads', currentPage, pageSize, searchTerm, statusFilter],
    queryFn: {
      queryKey: ['/api/leads', { 
        page: currentPage, 
        pageSize: pageSize,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      }],
    }
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Function to get lead badge color based on status
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'bg-blue-500';
      case 'contacted':
        return 'bg-yellow-500';
      case 'qualified':
        return 'bg-green-500';
      case 'unqualified':
        return 'bg-red-500';
      case 'nurturing':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <MobileLayout title="Leads">
      <div className="space-y-4">
        {/* Search and filter bar */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="unqualified">Unqualified</SelectItem>
              <SelectItem value="nurturing">Nurturing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add New Lead button */}
        <Link href="/leads/new">
          <Button className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add New Lead
          </Button>
        </Link>

        {/* Leads list */}
        <div className="space-y-3">
          {isLoading ? (
            // Loading skeletons
            Array(5).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <div className="flex items-center space-x-4 mt-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : leadsResponse?.data && leadsResponse.data.length > 0 ? (
            // Leads list
            leadsResponse.data.map((lead: any) => (
              <Card key={lead.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <Link href={`/leads/${lead.id}`}>
                    <div className="p-4 hover:bg-muted/50 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium truncate">{lead.name}</h3>
                          
                          {lead.company && (
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <Building className="h-3.5 w-3.5 mr-1" />
                              <span className="truncate">{lead.company.name}</span>
                            </div>
                          )}
                          
                          {lead.contactName && (
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <User className="h-3.5 w-3.5 mr-1" />
                              <span className="truncate">{lead.contactName}</span>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge 
                              variant="secondary"
                              className={`${getStatusColor(lead.status)} text-white`}
                            >
                              {lead.status || 'No Status'}
                            </Badge>
                            
                            <Badge variant="outline" className="text-xs">
                              {lead.source || 'No Source'}
                            </Badge>
                            
                            {lead.nextFollowUp && (
                              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                <Calendar className="h-3 w-3" />
                                {new Date(lead.nextFollowUp).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 shrink-0">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Quick actions */}
                  <div className="flex border-t divide-x">
                    <Link href={`/task-create/${lead.id}`} className="flex-1">
                      <Button variant="ghost" className="w-full h-10 rounded-none text-xs">
                        Add Task
                      </Button>
                    </Link>
                    <Link href={`/activity-create/${lead.id}`} className="flex-1">
                      <Button variant="ghost" className="w-full h-10 rounded-none text-xs">
                        Log Activity
                      </Button>
                    </Link>
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="flex-1">
                        <Button variant="ghost" className="w-full h-10 rounded-none text-xs">
                          <Phone className="h-3.5 w-3.5 mr-1" />
                          Call
                        </Button>
                      </a>
                    )}
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="flex-1">
                        <Button variant="ghost" className="w-full h-10 rounded-none text-xs">
                          <Mail className="h-3.5 w-3.5 mr-1" />
                          Email
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            // No leads found
            <div className="text-center py-10 space-y-2">
              <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">No leads found</p>
              <Link href="/leads/new">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first lead
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {leadsResponse?.totalPages && leadsResponse.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {leadsResponse.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === leadsResponse.totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}