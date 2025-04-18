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
import { Plus, MoreVertical, Search, Filter, Download, PackageOpen, FileText, Truck } from "lucide-react";

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  // Default orders for initial rendering
  const defaultOrders = [
    { id: 1, orderNumber: "ORD-2023-001", company: "Acme Corp", total: "$12,500.00", status: "pending", orderDate: "2023-07-15", quotationNumber: "QT-2023-001" },
    { id: 2, orderNumber: "ORD-2023-002", company: "TechGiant Inc", total: "$45,000.00", status: "processing", orderDate: "2023-07-14", quotationNumber: "QT-2023-002" },
    { id: 3, orderNumber: "ORD-2023-003", company: "SecureData LLC", total: "$8,750.00", status: "delivered", orderDate: "2023-07-10", quotationNumber: "QT-2023-003" },
    { id: 4, orderNumber: "ORD-2023-004", company: "DigiFuture Co", total: "$18,300.00", status: "completed", orderDate: "2023-07-08", quotationNumber: "QT-2023-004" },
    { id: 5, orderNumber: "ORD-2023-005", company: "GlobalTech Inc", total: "$27,500.00", status: "cancelled", orderDate: "2023-06-25", quotationNumber: "QT-2023-005" },
  ];

  // Filter orders based on search query
  const filteredOrders = orders
    ? orders.filter(
        (order: any) =>
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.company && order.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (order.quotationNumber && order.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : defaultOrders.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.company && order.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (order.quotationNumber && order.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "processing":
        return <Badge variant="primary">Processing</Badge>;
      case "delivered":
        return <Badge variant="qualification">Delivered</Badge>;
      case "completed":
        return <Badge variant="won">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Orders</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your sales orders and track their status</p>
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
              Create Order
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <Input
              type="text"
              placeholder="Search orders by number, company, or quotation..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Quotation #</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                        <PackageOpen className="h-4 w-4" />
                      </div>
                      {order.orderNumber}
                    </div>
                  </TableCell>
                  <TableCell>{order.quotationNumber || "-"}</TableCell>
                  <TableCell>{order.company}</TableCell>
                  <TableCell>{order.total}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" title="View Order">
                        <FileText className="h-4 w-4 text-slate-500" />
                      </Button>
                      {order.status === "pending" && (
                        <Button variant="ghost" size="icon" title="Update Status">
                          <Truck className="h-4 w-4 text-slate-500" />
                        </Button>
                      )}
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
                          <DropdownMenuItem>Update Status</DropdownMenuItem>
                          <DropdownMenuItem>Create Invoice</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Cancel Order</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
