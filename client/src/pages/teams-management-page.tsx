import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  MoreHorizontal,
  Trash,
  Edit,
  UserPlus,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TeamsManagementPage() {
  const { user } = useAuth();
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isManagingMembers, setIsManagingMembers] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newTeamData, setNewTeamData] = useState({
    name: "",
    description: "",
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    role: "sales_executive",
    teamId: null as number | null,
    managerId: null as number | null,
  });
  const { toast } = useToast();

  const isAdmin = user?.role === "admin";

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access the team management page.
              Only administrators can manage teams.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Fetch teams
  const { data: teams, isLoading: isLoadingTeams } = useQuery({
    queryKey: ["/api/teams"],
  });

  // Helper function to normalize user data structure
  const normalizeUser = (user: any): User => {
    return {
      ...user,
      // Ensure consistent property names regardless of API response format
      id: user.id,
      username: user.username || "",
      fullName: user.fullName || user.full_name || "",
      email: user.email || "",
      role: user.role || "",
      teamId: user.teamId !== undefined ? user.teamId : (user.team_id !== undefined ? user.team_id : null),
      managerId: user.managerId !== undefined ? user.managerId : (user.manager_id !== undefined ? user.manager_id : null),
      isActive: user.isActive !== undefined ? user.isActive : (user.is_active !== undefined ? user.is_active : true)
    };
  };

  // Fetch users
  const { data: rawUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users", { includeTeam: true }],
    queryFn: async ({ queryKey }) => {
      const [_path, params] = queryKey;
      const url = new URL(_path as string, window.location.origin);
      if (params && typeof params === 'object') {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    }
  });
  
  // Normalize all user data for consistency
  const users = React.useMemo(() => {
    return Array.isArray(rawUsers) ? rawUsers.map(normalizeUser) : [];
  }, [rawUsers]);

  // Define types for clarity
  interface Team {
    id: number;
    name: string;
    description: string | null;
    createdAt: string | Date;
  }
  
  interface User {
    id: number;
    username: string;
    fullName: string;
    email: string;
    role: string;
    teamId: number | null;
    managerId: number | null;
    isActive: boolean;
  }
  
  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (teamData: { name: string; description: string }) => {
      const response = await apiRequest("POST", "/api/teams", teamData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setIsCreatingTeam(false);
      setNewTeamData({ name: "", description: "" });
      toast({
        title: "Team created",
        description: "The team has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update team mutation
  const updateTeamMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; description: string | null } }) => {
      const response = await apiRequest("PATCH", `/api/teams/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setSelectedTeam(null);
      toast({
        title: "Team updated",
        description: "The team has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update team. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/teams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({
        title: "Team deleted",
        description: "The team has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete team. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Assign user to team mutation
  const assignTeamMutation = useMutation({
    mutationFn: async ({ userId, teamId }: { userId: number; teamId: number | null }) => {
      const response = await apiRequest("PATCH", `/api/users/${userId}/assign-team`, { teamId });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({
        title: "User assigned",
        description: "The user has been assigned to the team successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign user to team. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Assign manager mutation
  const assignManagerMutation = useMutation({
    mutationFn: async ({ userId, managerId }: { userId: number; managerId: number | null }) => {
      const response = await apiRequest("PATCH", `/api/users/${userId}/assign-manager`, { managerId });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Manager assigned",
        description: "The manager has been assigned successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign manager. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const response = await apiRequest("PATCH", `/api/users/${userId}`, { role });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Role updated",
        description: "The user's role has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUserData) => {
      const response = await apiRequest("POST", "/api/register", userData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreatingUser(false);
      setNewUserData({
        username: "",
        password: "",
        fullName: "",
        email: "",
        role: "sales_executive",
        teamId: null,
        managerId: null,
      });
      toast({
        title: "User created",
        description: "The user has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateTeam = () => {
    if (!newTeamData.name) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    createTeamMutation.mutate(newTeamData);
  };

  const handleUpdateTeam = () => {
    if (!selectedTeam || !selectedTeam.name) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    updateTeamMutation.mutate({
      id: selectedTeam.id,
      data: {
        name: selectedTeam.name,
        description: selectedTeam.description,
      },
    });
  };

  const handleDeleteTeam = (id: number) => {
    if (window.confirm("Are you sure you want to delete this team? This action cannot be undone.")) {
      deleteTeamMutation.mutate(id);
    }
  };

  const handleAssignTeam = (userId: number, teamId: number | null) => {
    assignTeamMutation.mutate({ userId, teamId });
  };

  const handleAssignManager = (userId: number, managerId: number | null) => {
    assignManagerMutation.mutate({ userId, managerId });
  };

  const handleUpdateRole = (userId: number, role: string) => {
    updateRoleMutation.mutate({ userId, role });
  };
  
  const handleCreateUser = () => {
    // Basic validation
    if (!newUserData.username || !newUserData.password || !newUserData.fullName || !newUserData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    // Password length validation
    if (newUserData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }
    
    createUserMutation.mutate(newUserData);
  };

  const openTeamEditDialog = (team: Team) => {
    setSelectedTeam({ ...team });
  };

  const openManageMembersDialog = (team: Team) => {
    setSelectedTeam({ ...team });
    setIsManagingMembers(true);
  };

  const getTeamName = (teamId: number | null) => {
    if (!teamId) return "No Team";
    const team = teams?.find((t: Team) => t.id === teamId);
    return team ? team.name : "Unknown Team";
  };

  const getManagerName = (managerId: number | null) => {
    if (!managerId) return "No Manager";
    const manager = users?.find((u: User) => u.id === managerId);
    return manager ? manager.fullName : "Unknown Manager";
  };

  const getTeamMembers = (teamId: number) => {
    return users?.filter((user: User) => user.teamId === teamId) || [];
  };

  // Get managers (users with sales_manager role)
  const managers = users?.filter((user: User) => 
    user.role === "sales_manager" || 
    user.role === "Sales Manager" || 
    user.role?.toLowerCase() === "sales_manager"
  ) || [];
  
  // Debug log to see available users and managers
  console.log("All users:", users);
  console.log("Filtered managers:", managers);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Team Management</h1>
            <p className="text-muted-foreground">
              Manage your sales teams, assign team members, and set reporting managers
            </p>
          </div>
          <Button onClick={() => setIsCreatingTeam(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Team
          </Button>
        </div>

        <Tabs defaultValue="teams">
          <TabsList className="mb-4">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="users">Users & Roles</TabsTrigger>
          </TabsList>

          <TabsContent value="teams">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams?.map((team: Team) => (
                <Card key={team.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle>{team.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openTeamEditDialog(team)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Team
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openManageMembersDialog(team)}>
                            <Users className="mr-2 h-4 w-4" />
                            Manage Members
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteTeam(team.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>{team.description || "No description"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Team Members:</span>
                      <span className="font-medium">{getTeamMembers(team.id).length}</span>
                    </div>
                    <div className="flex -space-x-3 mt-2">
                      {getTeamMembers(team.id)
                        .slice(0, 5)
                        .map((member: User) => (
                          <Avatar key={member.id} className="border-2 border-background h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {member.fullName?.split(" ").map((n: string) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      {getTeamMembers(team.id).length > 5 && (
                        <Avatar className="border-2 border-background h-8 w-8 bg-muted">
                          <AvatarFallback className="text-xs">
                            +{getTeamMembers(team.id).length - 5}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 pt-3">
                    <div className="w-full text-sm text-muted-foreground flex justify-between">
                      <span>Created: {new Date(team.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}

              {(!teams || teams.length === 0) && !isLoadingTeams && (
                <div className="col-span-full flex justify-center p-8">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">No teams found</h3>
                    <p className="text-muted-foreground mb-4">Create your first team to get started</p>
                    <Button onClick={() => setIsCreatingTeam(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Team
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Assign users to teams, manage reporting structure, and set user roles
                  </CardDescription>
                </div>
                <Button onClick={() => setIsCreatingUser(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Reports To</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {user.fullName?.split(" ").map((n: string) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.fullName}</div>
                              <div className="text-sm text-muted-foreground">{user.username}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            defaultValue={user.teamId?.toString() || "no_team"}
                            onValueChange={(value) => handleAssignTeam(user.id, value === "no_team" ? null : parseInt(value))}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no_team">No Team</SelectItem>
                              {teams?.map((team: Team) => (
                                <SelectItem key={team.id} value={team.id.toString()}>
                                  {team.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            defaultValue={user.role || ""}
                            onValueChange={(value) => handleUpdateRole(user.id, value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="sales_manager">Sales Manager</SelectItem>
                              <SelectItem value="sales_executive">Sales Executive</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            defaultValue={user.managerId?.toString() || "no_manager"}
                            onValueChange={(value) =>
                              handleAssignManager(user.id, value === "no_manager" ? null : parseInt(value))
                            }
                            disabled={user.role === "admin"}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select manager" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no_manager">No Manager</SelectItem>
                              {managers.map((manager: User) => (
                                <SelectItem key={manager.id} value={manager.id.toString()}>
                                  {manager.fullName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Team Dialog */}
      <Dialog open={isCreatingTeam} onOpenChange={setIsCreatingTeam}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Add a new team to organize your sales staff
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={newTeamData.name}
                onChange={(e) => setNewTeamData({ ...newTeamData, name: e.target.value })}
                placeholder="Enter team name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTeamData.description}
                onChange={(e) => setNewTeamData({ ...newTeamData, description: e.target.value })}
                placeholder="Enter team description"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateTeam} disabled={createTeamMutation.isPending}>
              {createTeamMutation.isPending ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={!!selectedTeam && !isManagingMembers} onOpenChange={(open) => !open && setSelectedTeam(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update team information
            </DialogDescription>
          </DialogHeader>
          {selectedTeam && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Team Name</Label>
                <Input
                  id="edit-name"
                  value={selectedTeam.name}
                  onChange={(e) => setSelectedTeam({ ...selectedTeam, name: e.target.value })}
                  placeholder="Enter team name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedTeam.description || ""}
                  onChange={(e) => setSelectedTeam({ ...selectedTeam, description: e.target.value })}
                  placeholder="Enter team description"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateTeam} disabled={updateTeamMutation.isPending}>
              {updateTeamMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={isCreatingUser} onOpenChange={setIsCreatingUser}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={newUserData.fullName}
                onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUserData.role}
                onValueChange={(value) => setNewUserData({ ...newUserData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="sales_manager">Sales Manager</SelectItem>
                  <SelectItem value="sales_executive">Sales Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="team">Team</Label>
              <Select
                value={newUserData.teamId?.toString() || "no_team"}
                onValueChange={(value) => 
                  setNewUserData({ 
                    ...newUserData, 
                    teamId: value === "no_team" ? null : parseInt(value) 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_team">No Team</SelectItem>
                  {teams?.map((team: Team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="manager">Reporting Manager</Label>
              <Select
                value={newUserData.managerId?.toString() || "no_manager"}
                onValueChange={(value) => 
                  setNewUserData({ 
                    ...newUserData, 
                    managerId: value === "no_manager" ? null : parseInt(value) 
                  })
                }
                disabled={newUserData.role === "admin"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_manager">No Manager</SelectItem>
                  {managers.map((manager: User) => (
                    <SelectItem key={manager.id} value={manager.id.toString()}>
                      {manager.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Team Members Dialog */}
      <Dialog open={isManagingMembers} onOpenChange={(open) => !open && setIsManagingMembers(false)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Manage Team Members - {selectedTeam?.name}</DialogTitle>
            <DialogDescription>
              Add or remove team members and set reporting structure
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Current Team Members</h3>
              <div className="border rounded-md divide-y">
                {selectedTeam && getTeamMembers(selectedTeam.id).length > 0 ? (
                  getTeamMembers(selectedTeam.id).map((member: User) => (
                    <div key={member.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {member.fullName?.split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.role === "sales_manager"
                              ? "Sales Manager"
                              : member.role === "sales_executive"
                              ? "Sales Executive"
                              : member.role}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          defaultValue={member.managerId?.toString() || "no_manager"}
                          onValueChange={(value) =>
                            handleAssignManager(member.id, value === "no_manager" ? null : parseInt(value))
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select manager" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no_manager">No Manager</SelectItem>
                            {managers.map((manager: User) => (
                              <SelectItem key={manager.id} value={manager.id.toString()}>
                                {manager.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignTeam(member.id, null)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No team members yet
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Add Team Members</h3>
              <div className="border rounded-md divide-y">
                {users
                  ?.filter((user: User) => user.teamId !== selectedTeam?.id)
                  .map((user: User) => (
                    <div key={user.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.fullName?.split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.role === "sales_manager"
                              ? "Sales Manager"
                              : user.role === "sales_executive"
                              ? "Sales Executive"
                              : user.role}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Button
                          size="sm"
                          onClick={() => handleAssignTeam(user.id, selectedTeam?.id)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add to Team
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Done</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}