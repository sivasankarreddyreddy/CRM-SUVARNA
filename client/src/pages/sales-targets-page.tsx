import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { User, Company, SalesTarget, insertSalesTargetSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/use-user";

const validYearType = ["financial", "calendar"] as const;
type YearType = (typeof validYearType)[number];

const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

// Extend the insert schema to include validation
const formSchema = insertSalesTargetSchema
  .extend({
    yearType: z.enum(validYearType),
    targetAmount: z.string().min(1, "Target amount is required"),
    userId: z.number().min(1, "Employee is required"),
    companyId: z.number().min(1, "Company is required"),
    month: z.string().min(1, "Month is required"),
    year: z.string().min(4, "Year is required"),
  })
  .omit({
    id: true,
    createdAt: true,
    createdBy: true,
  });

type FormValues = z.infer<typeof formSchema>;

export default function SalesTargetsPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<SalesTarget | null>(null);
  const { user } = useUser();

  const { data: salesTargets = [], isLoading: isLoadingSalesTargets } = useQuery({
    queryKey: ["/api/sales-targets"],
    queryFn: async () => {
      const res = await fetch("/api/sales-targets");
      if (!res.ok) throw new Error("Failed to fetch sales targets");
      return await res.json();
    },
  });

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return await res.json();
    },
  });

  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["/api/companies"],
    queryFn: async () => {
      const res = await fetch("/api/companies");
      if (!res.ok) throw new Error("Failed to fetch companies");
      return await res.json();
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: undefined,
      companyId: undefined,
      month: "",
      year: new Date().getFullYear().toString(),
      yearType: "calendar",
      targetAmount: "",
    },
  });

  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: undefined,
      companyId: undefined,
      month: "",
      year: new Date().getFullYear().toString(),
      yearType: "calendar",
      targetAmount: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await apiRequest("POST", "/api/sales-targets", {
        ...values,
        targetAmount: parseFloat(values.targetAmount),
        month: parseInt(values.month),
        year: parseInt(values.year),
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/sales-targets"] });
      setIsCreateOpen(false);
      form.reset();
      
      toast({
        title: "Success",
        description: "Sales target created successfully",
      });
    } catch (error) {
      console.error("Error creating sales target:", error);
      toast({
        title: "Error",
        description: "Failed to create sales target",
        variant: "destructive",
      });
    }
  };

  const onEdit = async (values: FormValues) => {
    if (!selectedTarget) return;
    
    try {
      await apiRequest("PATCH", `/api/sales-targets/${selectedTarget.id}`, {
        ...values,
        targetAmount: parseFloat(values.targetAmount),
        month: parseInt(values.month),
        year: parseInt(values.year),
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/sales-targets"] });
      setIsEditOpen(false);
      editForm.reset();
      
      toast({
        title: "Success",
        description: "Sales target updated successfully",
      });
    } catch (error) {
      console.error("Error updating sales target:", error);
      toast({
        title: "Error",
        description: "Failed to update sales target",
        variant: "destructive",
      });
    }
  };

  const onDelete = async () => {
    if (!selectedTarget) return;
    
    try {
      await apiRequest("DELETE", `/api/sales-targets/${selectedTarget.id}`);
      
      queryClient.invalidateQueries({ queryKey: ["/api/sales-targets"] });
      setIsDeleteOpen(false);
      
      toast({
        title: "Success",
        description: "Sales target deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting sales target:", error);
      toast({
        title: "Error",
        description: "Failed to delete sales target",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (target: SalesTarget) => {
    setSelectedTarget(target);
    editForm.reset({
      userId: target.userId,
      companyId: target.companyId,
      month: target.month.toString(),
      year: target.year.toString(),
      yearType: target.yearType as YearType,
      targetAmount: target.targetAmount.toString(),
    });
    setIsEditOpen(true);
  };

  const handleDeleteClick = (target: SalesTarget) => {
    setSelectedTarget(target);
    setIsDeleteOpen(true);
  };

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "sales_manager";

  const getEmployeeName = (userId: number) => {
    const employee = users.find((user) => user.id === userId);
    return employee ? employee.fullName : "Unknown";
  };

  const getCompanyName = (companyId: number) => {
    const company = companies.find((company) => company.id === companyId);
    return company ? company.name : "Unknown";
  };

  const getMonthName = (month: number) => {
    const monthObj = months.find((m) => parseInt(m.value) === month);
    return monthObj ? monthObj.label : "Unknown";
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Targets</h1>
          <p className="text-muted-foreground">
            Manage sales targets for your team members
          </p>
        </div>
        {(isAdmin || isManager) && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Assign New Target
          </Button>
        )}
      </div>

      <Separator className="my-4" />

      <Card>
        <CardHeader>
          <CardTitle>Sales Targets</CardTitle>
          <CardDescription>
            Review and manage sales targets for your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSalesTargets || isLoadingUsers || isLoadingCompanies ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-pulse text-primary">Loading...</div>
            </div>
          ) : salesTargets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No sales targets found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Year Type</TableHead>
                  <TableHead>Target Amount (₹)</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesTargets.map((target) => (
                  <TableRow key={target.id}>
                    <TableCell>{getEmployeeName(target.userId)}</TableCell>
                    <TableCell>{getCompanyName(target.companyId)}</TableCell>
                    <TableCell>
                      {getMonthName(target.month)} {target.year}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {target.yearType}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{target.targetAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      {target.createdAt
                        ? format(new Date(target.createdAt), "MMM d, yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      {(isAdmin || isManager || user?.id === target.userId) && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(target)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {(isAdmin || isManager) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(target)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Sales Target Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create Sales Target</DialogTitle>
            <DialogDescription>
              Assign a new sales target to a team member
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="2025" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yearType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="calendar">Calendar</SelectItem>
                          <SelectItem value="financial">Financial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount (₹)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="500000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Sales Target Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Sales Target</DialogTitle>
            <DialogDescription>
              Update the sales target details
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="2025" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="yearType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="calendar">Calendar</SelectItem>
                          <SelectItem value="financial">Financial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount (₹)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="500000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Sales Target</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this sales target? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}