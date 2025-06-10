import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { 
  ArrowLeft,
  UserPlus,
  User,
  Briefcase,
  Mail,
  UserCog,
  MoreHorizontal
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { Team, User as UserType, Lead, Opportunity } from "@shared/schema";

export default function TeamDetailsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, params] = useRoute<{ id: string }>("/teams/:id");
  const teamId = params ? parseInt(params.id) : 0;
  const [selectedTab, setSelectedTab] = useState("members");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null);
  
  // Check if user is admin
  const isAdmin = user?.role === "admin";
  const isSalesManager = user?.role === "sales_manager";
  
  // Fetch team details
  const { data: team, isLoading: isTeamLoading } = useQuery<Team>({
    queryKey: ["/api/teams", teamId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/teams/${teamId}`);
      return res.json();
    },
    enabled: !!teamId && !!user,
  });
  
  // Fetch team members
  const { data: members, isLoading: isMembersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/teams", teamId, "members"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/teams/${teamId}/members`);
      return res.json();
    },
    enabled: !!teamId && !!user,
  });
  
  // Fetch team leads
  const { data: leads, isLoading: isLeadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/teams", teamId, "leads"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/teams/${teamId}/leads`);
      return res.json();
    },
    enabled: !!teamId && !!user && selectedTab === "leads",
  });
  
  // Fetch team opportunities
  const { data: opportunities, isLoading: isOpportunitiesLoading } = useQuery<Opportunity[]>({
    queryKey: ["/api/teams", teamId, "opportunities"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/teams/${teamId}/opportunities`);
      return res.json();
    },
    enabled: !!teamId && !!user && selectedTab === "opportunities",
  });
  
  // Fetch team managers 
  const { data: managers } = useQuery<UserType[]>({
    queryKey: ["/api/teams", teamId, "managers"],
    queryFn: async () => {
      // Find managers from the members list
      if (members) {
        return members.filter(member => member.role === "sales_manager");
      }
      return [];
    },
    enabled: !!teamId && !!user && !!members,
  });
  
  // Fetch team members by manager
  const { data: managerMembers, isLoading: isManagerMembersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/managers", selectedManagerId, "members"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/managers/${selectedManagerId}/members`);
      return res.json();
    },
    enabled: !!selectedManagerId && !!user && selectedTab === "by-manager",
  });
  
  // Fetch all users for assignment
  const { data: allUsers } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users");
      return res.json();
    },
    enabled: !!user && isAdmin,
  });
  
  // Assign user to team mutation
  const assignUserMutation = useMutation({
    mutationFn: async (data: { userId: number; teamId: number }) => {
      const res = await apiRequest("PATCH", `/api/users/${data.userId}/assign-team`, { teamId: data.teamId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", teamId, "members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setAssignDialogOpen(false);
      toast({
        title: "User assigned",
        description: "The user has been assigned to the team successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to assign user",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Remove user from team mutation
  const removeUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/assign-team`, { teamId: null });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", teamId, "members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User removed",
        description: "The user has been removed from the team successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove user",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle assigning a user to the team
  const handleAssignUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      assignUserMutation.mutate({ userId: selectedUserId, teamId });
    }
  };
  
  // Handle removing a user from the team
  const handleRemoveUser = (userId: number) => {
    if (window.confirm("Are you sure you want to remove this user from the team?")) {
      removeUserMutation.mutate(userId);
    }
  };
  
  // Filter out users who are already in the team
  const availableUsers = allUsers?.filter(u => 
    !members?.some(m => m.id === u.id)
  ) || [];
  
  if (!user) {
    return null; // Loading state handled by ProtectedRoute
  }
  
  if (isTeamLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!team) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Team Not Found</CardTitle>
            <CardDescription>
              The team you're looking for doesn't exist or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/teams">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Teams
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/teams">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{team.name}</h1>
        </div>
      
      {team.description && (
        <p className="text-muted-foreground mb-8">{team.description}</p>
      )}
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="by-manager">By Manager</TabsTrigger>
          <TabsTrigger value="leads">Team Leads</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="by-manager">
          <Card>
            <CardHeader>
              <CardTitle>Team Members by Manager</CardTitle>
              <CardDescription>
                View team members organized by their managers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isMembersLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : !managers || managers.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No managers in this team</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {selectedManagerId && (
                    <div className="mb-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedManagerId(null)}
                        className="mb-4"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Managers List
                      </Button>
                      
                      {isManagerMembersLoading ? (
                        <div className="flex justify-center py-6">
                          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : !managerMembers || managerMembers.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">No team members assigned to this manager</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Role</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {managerMembers.map((member) => (
                              <TableRow key={member.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{member.fullName}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    {member.email}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {member.role === "admin"
                                      ? "Administrator"
                                      : member.role === "sales_manager"
                                      ? "Sales Manager"
                                      : "Sales Executive"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}
                  
                  {!selectedManagerId && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {managers.map((manager) => (
                        <Card key={manager.id} className="hover:bg-muted/40 transition-colors cursor-pointer"
                          onClick={() => setSelectedManagerId(manager.id)}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <UserCog className="h-5 w-5 text-primary" />
                              {manager.fullName}
                            </CardTitle>
                            <CardDescription>{manager.email}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">Click to view team members under this manager</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage users assigned to this team
                  </CardDescription>
                </div>
                {isAdmin && (
                  <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={handleAssignUser}>
                        <DialogHeader>
                          <DialogTitle>Assign User to Team</DialogTitle>
                          <DialogDescription>
                            Select a user to assign to this team.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="userId">Select User</Label>
                            <Select
                              onValueChange={(value) => setSelectedUserId(parseInt(value))}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a user" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableUsers.map((user) => (
                                  <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.fullName}
                                  </SelectItem>
                                ))}
                                {availableUsers.length === 0 && (
                                  <SelectItem value="null" disabled>
                                    No available users
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setAssignDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={
                              assignUserMutation.isPending ||
                              !selectedUserId ||
                              availableUsers.length === 0
                            }
                          >
                            {assignUserMutation.isPending
                              ? "Assigning..."
                              : "Assign User"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isMembersLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : members?.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No members in this team</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members?.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{member.fullName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {member.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.role === "sales_manager" ? "default" : "outline"}>
                            {member.role === "admin"
                              ? "Administrator"
                              : member.role === "sales_manager"
                              ? "Sales Manager"
                              : "Sales Executive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {isAdmin && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleRemoveUser(member.id)}
                                  className="text-destructive"
                                >
                                  Remove from team
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Team Leads</CardTitle>
              <CardDescription>
                Leads assigned to this team
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLeadsLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : leads?.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No leads assigned to this team</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads?.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <Link to={`/leads/${lead.id}`} className="font-medium hover:underline">
                            {lead.name}
                          </Link>
                        </TableCell>
                        <TableCell>{lead.companyName || "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              lead.status === "new"
                                ? "default"
                                : lead.status === "qualified"
                                ? "secondary"
                                : lead.status === "disqualified"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lead.assignedTo ? (
                            members?.find(m => m.id === lead.assignedTo)?.fullName || "Unknown"
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle>Team Opportunities</CardTitle>
              <CardDescription>
                Opportunities managed by this team
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isOpportunitiesLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : opportunities?.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No opportunities assigned to this team</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Assigned To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opportunities?.map((opportunity) => (
                      <TableRow key={opportunity.id}>
                        <TableCell>
                          <Link to={`/opportunities/${opportunity.id}`} className="font-medium hover:underline">
                            {opportunity.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {opportunity.companyId ? (
                            <Link
                              to={`/companies/${opportunity.companyId}`}
                              className="hover:underline flex items-center gap-2"
                            >
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              Company #{opportunity.companyId}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              opportunity.stage === "qualification"
                                ? "default"
                                : opportunity.stage === "proposal"
                                ? "secondary"
                                : opportunity.stage === "negotiation"
                                ? "outline"
                                : opportunity.stage === "closing"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {opportunity.stage}
                          </Badge>
                        </TableCell>
                        <TableCell>${opportunity.value}</TableCell>
                        <TableCell>
                          {opportunity.assignedTo ? (
                            members?.find(m => m.id === opportunity.assignedTo)?.fullName || "Unknown"
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  );
}