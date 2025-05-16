import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { MobileLayout } from '@/components/layouts/mobile-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  ArrowUpRight,
  CircleDollarSign,
  Users,
  Briefcase,
  ShoppingCart,
  Activity,
  PlusCircle,
  Phone,
  CalendarPlus
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function MobileDashboardPage() {
  const [periodFilter, setPeriodFilter] = useState<string>("thisMonth");
  const { toast } = useToast();
  
  // Fetch dashboard statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats', periodFilter],
    queryFn: {
      queryKey: ['/api/dashboard/stats', { period: periodFilter }],
    }
  });

  // Fetch pipeline data
  const { data: pipelineData, isLoading: pipelineLoading } = useQuery({
    queryKey: ['/api/dashboard/pipeline', periodFilter],
    queryFn: {
      queryKey: ['/api/dashboard/pipeline', { period: periodFilter }],
    }
  });

  // Fetch recent opportunities
  const { data: recentOpportunities, isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['/api/opportunities/recent', periodFilter],
    queryFn: {
      queryKey: ['/api/opportunities/recent', { period: periodFilter }],
    }
  });

  // Fetch today's tasks
  const { data: todayTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks/today'],
    queryFn: {
      queryKey: ['/api/tasks/today'],
    }
  });

  // Quick Action buttons for mobile
  const quickActions = [
    { name: 'New Lead', icon: <Users className="h-5 w-5" />, href: '/leads/new' },
    { name: 'New Task', icon: <PlusCircle className="h-5 w-5" />, href: '/task-create' },
    { name: 'New Call', icon: <Phone className="h-5 w-5" />, href: '/activity-create' },
    { name: 'New Meeting', icon: <CalendarPlus className="h-5 w-5" />, href: '/calendar' },
  ];

  // Prepare pipeline data for chart
  const pipelineChartData = pipelineData?.stages.map((stage) => ({
    name: stage.name,
    value: parseInt(stage.value.replace(/[^0-9]/g, '')) || 0,
    count: stage.count,
    color: stage.color
  })) || [];

  // Calculate total pipeline value
  const totalPipelineValue = pipelineChartData.reduce((acc, curr) => acc + curr.value, 0);

  // Period filter options
  const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisQuarter', label: 'This Quarter' },
    { value: 'thisYear', label: 'This Year' }
  ];

  // Format currency with Indian Rupee symbol
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <MobileLayout title="Dashboard">
      <div className="space-y-4">
        {/* Period filter */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4">
          {periodOptions.map((period) => (
            <Button
              key={period.value}
              variant={periodFilter === period.value ? "default" : "outline"}
              size="sm"
              className="mr-2 whitespace-nowrap"
              onClick={() => setPeriodFilter(period.value)}
            >
              {period.label}
            </Button>
          ))}
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action) => (
            <Link key={action.name} href={action.href}>
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col justify-center"
              >
                {action.icon}
                <span className="mt-1 text-xs font-normal">{action.name}</span>
              </Button>
            </Link>
          ))}
        </div>

        {/* Key Stats Cards */}
        <div className="grid grid-cols-2 gap-2">
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {statsLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <div className="flex items-baseline">
                  <div className="text-2xl font-bold">
                    {statsData?.totalLeads.value || '0'}
                  </div>
                  {statsData?.totalLeads.change !== 0 && (
                    <div className={`ml-2 text-xs ${
                      (statsData?.totalLeads.change || 0) > 0 
                        ? 'text-green-500' 
                        : 'text-red-500'
                    }`}>
                      {(statsData?.totalLeads.change || 0) > 0 ? '+' : ''}
                      {statsData?.totalLeads.change || 0}%
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm font-medium">Open Deals</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {statsLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <div className="flex items-baseline">
                  <div className="text-2xl font-bold">
                    {statsData?.openDeals.value || '0'}
                  </div>
                  {statsData?.openDeals.change !== 0 && (
                    <div className={`ml-2 text-xs ${
                      (statsData?.openDeals.change || 0) > 0 
                        ? 'text-green-500' 
                        : 'text-red-500'
                    }`}>
                      {(statsData?.openDeals.change || 0) > 0 ? '+' : ''}
                      {statsData?.openDeals.change || 0}%
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm font-medium">MTD Sales</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {statsLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <div className="flex items-baseline">
                  <div className="text-2xl font-bold">
                    {statsData?.salesMtd.value || '₹0'}
                  </div>
                  {statsData?.salesMtd.change !== 0 && (
                    <div className={`ml-2 text-xs ${
                      (statsData?.salesMtd.change || 0) > 0 
                        ? 'text-green-500' 
                        : 'text-red-500'
                    }`}>
                      {(statsData?.salesMtd.change || 0) > 0 ? '+' : ''}
                      {statsData?.salesMtd.change || 0}%
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm font-medium">Conversion</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {statsLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <div className="flex items-baseline">
                  <div className="text-2xl font-bold">
                    {statsData?.conversionRate.value || '0%'}
                  </div>
                  {statsData?.conversionRate.change !== 0 && (
                    <div className={`ml-2 text-xs ${
                      (statsData?.conversionRate.change || 0) > 0 
                        ? 'text-green-500' 
                        : 'text-red-500'
                    }`}>
                      {(statsData?.conversionRate.change || 0) > 0 ? '+' : ''}
                      {statsData?.conversionRate.change || 0}%
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Data */}
        <Tabs defaultValue="pipeline" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="opportunities">Deals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pipeline">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-md">Sales Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                {pipelineLoading ? (
                  <Skeleton className="h-60 w-full" />
                ) : (
                  <>
                    <div className="text-xl font-bold mb-2">
                      {formatCurrency(totalPipelineValue)}
                    </div>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={pipelineChartData}
                          layout="vertical"
                          margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tickFormatter={(value) => `₹${value/1000}K`} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                          <Tooltip 
                            formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']}
                            labelFormatter={(label) => `Stage: ${label}`}
                          />
                          <Bar dataKey="value" name="Value" radius={[0, 4, 4, 0]}>
                            {pipelineChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks">
            <Card>
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-md">Today's Tasks</CardTitle>
                <Link href="/task-create">
                  <Button size="sm" variant="ghost">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    <span>New</span>
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {tasksLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full mb-2" />
                  ))
                ) : todayTasks && todayTasks.length > 0 ? (
                  <div className="space-y-2">
                    {todayTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="border rounded-md p-3 flex justify-between">
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-xs text-muted-foreground">
                            Due: {new Date(task.dueDate).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {task.assigneeName && ` • ${task.assigneeName}`}
                          </div>
                        </div>
                        <Link href={`/tasks/${task.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                    {todayTasks.length > 5 && (
                      <Link href="/tasks">
                        <Button variant="outline" className="w-full mt-2">
                          View All ({todayTasks.length})
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No tasks for today
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="opportunities">
            <Card>
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-md">Recent Opportunities</CardTitle>
                <Link href="/opportunities/new">
                  <Button size="sm" variant="ghost">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    <span>New</span>
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {opportunitiesLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full mb-2" />
                  ))
                ) : recentOpportunities && recentOpportunities.length > 0 ? (
                  <div className="space-y-2">
                    {recentOpportunities.slice(0, 5).map((opp) => (
                      <div key={opp.id} className="border rounded-md p-3 flex justify-between">
                        <div>
                          <div className="font-medium">{opp.name}</div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <CircleDollarSign className="h-3 w-3 mr-1" />
                            {opp.value ? `₹${parseInt(opp.value).toLocaleString()}` : 'N/A'}
                            <span className="ml-2 px-1.5 rounded text-xs" style={{ 
                              backgroundColor: opp.stageColor || '#cbd5e1',
                              color: '#fff'
                            }}>
                              {opp.stage}
                            </span>
                          </div>
                        </div>
                        <Link href={`/opportunities/${opp.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                    {recentOpportunities.length > 5 && (
                      <Link href="/opportunities">
                        <Button variant="outline" className="w-full mt-2">
                          View All ({recentOpportunities.length})
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No recent opportunities
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}