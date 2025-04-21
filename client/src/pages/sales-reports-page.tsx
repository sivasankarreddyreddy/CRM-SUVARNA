import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Loader2 } from "lucide-react";

// Define custom colors for charts
const COLORS = ['#3b82f6', '#4f46e5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function SalesReportsPage() {
  const [period, setPeriod] = useState("monthly");
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/reports/sales', period],
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
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Format percentages
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Sales Reports</h1>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {formatCurrency(data?.salesByPeriod?.reduce((sum: number, item: any) => sum + item.total_sales, 0) || 0)}
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Deal Size</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {formatCurrency((data?.salesByPeriod?.reduce((sum: number, item: any) => sum + item.total_sales, 0) || 0) / 
                (data?.opportunityConversion?.converted_opportunities || 1))}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Based on all closed opportunities
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {formatPercentage(data?.opportunityConversion?.conversion_rate || 0)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Opportunities to Closed Deals
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products Sold</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {data?.topProducts?.reduce((sum: number, item: any) => sum + item.total_quantity, 0) || 0}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Units across all product categories
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="sales_trends" className="w-full">
        <TabsList>
          <TabsTrigger value="sales_trends">Sales Trends</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="companies">Top Companies</TabsTrigger>
        </TabsList>
        <TabsContent value="sales_trends">
          <Card>
            <CardHeader>
              <CardTitle>Sales Over Time</CardTitle>
              <CardDescription>
                Revenue trends for the selected {period} period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data?.salesByPeriod}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time_period" angle={-45} textAnchor="end" height={70} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value as number), "Sales"]}
                      labelFormatter={(label) => `Period: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="total_sales" 
                      fill="#3b82f6" 
                      name="Sales" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Products by Revenue</CardTitle>
                <CardDescription>
                  Highest performing products by total sales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data?.topProducts}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 70, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                      <YAxis dataKey="name" type="category" width={70} />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value as number), "Revenue"]}
                      />
                      <Legend />
                      <Bar 
                        dataKey="total_revenue" 
                        fill="#4f46e5" 
                        name="Revenue" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Products by Quantity</CardTitle>
                <CardDescription>
                  Highest selling products by units sold
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart width={400} height={400}>
                      <Pie
                        data={data?.topProducts}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="total_quantity"
                        nameKey="name"
                      >
                        {data?.topProducts?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} units`, "Quantity Sold"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>Top Companies by Sales</CardTitle>
              <CardDescription>
                Companies generating the most revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data?.salesByCompany}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value as number), "Sales"]}
                    />
                    <Legend />
                    <Bar dataKey="total_sales" fill="#8b5cf6" name="Sales">
                      {data?.salesByCompany?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}