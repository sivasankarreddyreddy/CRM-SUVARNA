import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Legend, Cell } from "recharts";
import { AlertTriangle } from "lucide-react";

// Define the type for vendor financial data
interface VendorFinancial {
  id: number;
  name: string;
  productCount: number;
  opportunityCount: number;
  quotationCount: number;
  salesOrderCount: number;
  totalOpportunityValue: string;
  totalSalesValue: string;
  conversionRate: number;
  color: string;
}

interface VendorFinancialsProps {
  period: string;
  onViewDetails?: () => void;
}

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border p-3 rounded-md shadow-md text-sm">
        <p className="font-medium">{data.name}</p>
        <p className="text-muted-foreground">Products: {data.productCount}</p>
        <p className="text-muted-foreground">Opportunities: {data.opportunityCount}</p>
        <p className="text-muted-foreground">Quotations: {data.quotationCount}</p>
        <p className="text-muted-foreground">Orders: {data.salesOrderCount}</p>
        <p className="text-muted-foreground">Conversion Rate: {data.conversionRate}%</p>
        <p className="font-medium mt-1">Total Sales: ₹{Number(data.totalSalesValue).toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

// Format number as Indian Rupees
const formatAsINR = (value: string) => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "₹0";
  
  // For values >= 1 lakh (100,000), show in lakhs with 2 decimal places
  if (numValue >= 100000) {
    const inLakhs = numValue / 100000;
    return `₹${inLakhs.toFixed(2)}L`;
  }
  
  // For values < 1 lakh, format with Indian thousands separator
  return `₹${numValue.toLocaleString('en-IN')}`;
};

export default function VendorFinancials({ period, onViewDetails }: VendorFinancialsProps) {
  const { data: vendors, isLoading, error } = useQuery<VendorFinancial[]>({
    queryKey: ["/api/vendors/financials", period],
    queryFn: async () => {
      const res = await fetch(`/api/vendors/financials?period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch vendor financial data");
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Vendor Financial Performance</CardTitle>
          <CardDescription>Top performing vendors by sales value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-[250px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Vendor Financial Performance</CardTitle>
          <CardDescription>Top performing vendors by sales value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mb-2 text-amber-500" />
            <p>Error loading vendor financial data.</p>
            <p className="text-sm">Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Take the top 5 vendors for display
  const topVendors = vendors ? vendors.slice(0, 5) : [];

  return (
    <Card className="col-span-full md:col-span-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Vendor Financial Performance</CardTitle>
        <CardDescription>Top performing vendors by sales value</CardDescription>
      </CardHeader>
      <CardContent>
        {topVendors.length > 0 ? (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topVendors}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }} 
                />
                <YAxis 
                  tickFormatter={formatAsINR}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="totalSalesValue" 
                  name="Sales Value" 
                  radius={[4, 4, 0, 0]}
                >
                  {topVendors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList 
                    dataKey="conversionRate" 
                    position="top" 
                    formatter={(value: number) => `${value}%`}
                    style={{ fontSize: '11px' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <p>No vendor financial data available for this period.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}