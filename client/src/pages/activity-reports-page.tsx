import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Loader2, Calendar, Clock, CheckCircle2, X, Mail, Phone, Users, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

// Define custom colors for charts
const COLORS = ['#3b82f6', '#4f46e5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

// Activity type to icon mapping
const ActivityTypeIcon = {
  email: Mail,
  call: Phone,
  meeting: Users,
  task: FileText,
  lead: Users,
} as const;

export default function ActivityReportsPage() {
  const [period, setPeriod] = useState("monthly");
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/reports/activities', period],
    enabled: true,
  });
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[70vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <h2 className="text-lg font-medium mb-2">Error loading report data</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </DashboardLayout>
    );
  }
  
  // Format percentages
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Activity Reports</h1>
        <div className="flex items-center space-x-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="period">Time Period</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {/* Summary Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Activities</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {data?.activityByPeriod?.reduce((sum: number, item: any) => sum + item.activity_count, 0) || 0}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              For the selected {period} period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Task Completion Rate</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {formatPercentage(data?.taskCompletionRate?.completion_rate || 0)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <Progress value={data?.taskCompletionRate?.completion_rate || 0} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Active User</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {data?.activityByUser?.[0]?.username || "None"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {data?.activityByUser?.[0]?.activity_count || 0} activities logged
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Activity Type</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {(data?.activityByType?.[0]?.type || "None").charAt(0).toUpperCase() + 
                (data?.activityByType?.[0]?.type || "None").slice(1)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {data?.activityByType?.[0]?.count || 0} activities of this type
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="activity_trends" className="w-full">
        <TabsList>
          <TabsTrigger value="activity_trends">Activity Trends</TabsTrigger>
          <TabsTrigger value="activity_types">Activity Types</TabsTrigger>
          <TabsTrigger value="users">User Performance</TabsTrigger>
          <TabsTrigger value="recent">Recent Activities</TabsTrigger>
        </TabsList>
        <TabsContent value="activity_trends">
          <Card>
            <CardHeader>
              <CardTitle>Activities Over Time</CardTitle>
              <CardDescription>
                Activity volume for the selected {period} period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data?.activityByPeriod}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time_period" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} activities`, "Count"]}
                      labelFormatter={(label) => `Period: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="activity_count" 
                      fill="#3b82f6" 
                      name="Activities" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity_types">
          <Card>
            <CardHeader>
              <CardTitle>Activity Distribution by Type</CardTitle>
              <CardDescription>
                Breakdown of activities by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.activityByType}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="type"
                    >
                      {data?.activityByType?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} activities`, "Count"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Activity by User</CardTitle>
              <CardDescription>
                Number of activities logged by each user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data?.activityByUser}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 70, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="username" type="category" width={70} />
                    <Tooltip 
                      formatter={(value) => [`${value} activities`, "Count"]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="activity_count" 
                      fill="#4f46e5" 
                      name="Activities" 
                    >
                      {data?.activityByUser?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Most recent activities across the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data?.recentActivities?.map((activity: any) => {
                  const ActivityIcon = ActivityTypeIcon[activity.type as keyof typeof ActivityTypeIcon] || FileText;
                  
                  return (
                    <div key={activity.id} className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <ActivityIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description || "No description provided"}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.createdAt ? format(new Date(activity.createdAt), 'PPP p') : "Unknown date"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}