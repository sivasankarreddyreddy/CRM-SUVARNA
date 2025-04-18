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
import { Plus, MoreVertical, Search, Filter, Download, Package } from "lucide-react";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  // Default products for initial rendering
  const defaultProducts = [
    { id: 1, name: "Cloud Storage Plan - Basic", sku: "CLD-BAS-001", price: "$99.99", tax: "10%", isActive: true },
    { id: 2, name: "Cloud Storage Plan - Premium", sku: "CLD-PRE-002", price: "$199.99", tax: "10%", isActive: true },
    { id: 3, name: "Security Audit Service", sku: "SEC-AUD-001", price: "$499.99", tax: "10%", isActive: true },
    { id: 4, name: "Website Development", sku: "WEB-DEV-001", price: "$999.99", tax: "10%", isActive: true },
    { id: 5, name: "Mobile App Development", sku: "MOB-DEV-001", price: "$1,499.99", tax: "10%", isActive: false },
    { id: 6, name: "SEO Optimization", sku: "SEO-OPT-001", price: "$299.99", tax: "10%", isActive: true },
  ];

  // Filter products based on search query
  const filteredProducts = products
    ? products.filter(
        (product: any) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : defaultProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Products & Services</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your product and service catalog</p>
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
              Add Product
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <Input
              type="text"
              placeholder="Search products by name or SKU..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                        <Package className="h-4 w-4" />
                      </div>
                      {product.name}
                    </div>
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.tax}</TableCell>
                  <TableCell>
                    {product.isActive ? (
                      <Badge variant="won">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
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
                        {product.isActive ? (
                          <DropdownMenuItem>Deactivate</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>Activate</DropdownMenuItem>
                        )}
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
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
