import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
import { ProductDetailDialog } from "@/components/products/product-detail-dialog";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { ProductDeleteDialog } from "@/components/products/product-delete-dialog";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";

export default function ProductsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for dialogs
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "duplicate">("create");

  // Fetch products
  const { data: productsResponse, isLoading, isError } = useQuery({
    queryKey: ["/api/products"],
  });
  
  // Extract the data array from the paginated response
  const products = productsResponse?.data || [];

  // Toggle product activation status
  const toggleActivationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest("PATCH", `/api/products/${id}`, { isActive });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.isActive ? "Product Activated" : "Product Deactivated",
        description: `${data.name} has been ${data.isActive ? "activated" : "deactivated"} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: `Failed to update product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle action menu item clicks
  const handleViewDetails = (product: any) => {
    setSelectedProduct(product);
    setIsDetailDialogOpen(true);
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setFormMode("edit");
    setIsFormDialogOpen(true);
  };

  const handleDuplicate = (product: any) => {
    setSelectedProduct(product);
    setFormMode("duplicate");
    setIsFormDialogOpen(true);
  };

  const handleToggleActivation = (product: any) => {
    toggleActivationMutation.mutate({
      id: product.id,
      isActive: !product.isActive,
    });
  };

  const handleDelete = (product: any) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setFormMode("create");
    setIsFormDialogOpen(true);
  };

  // Filter products based on search query
  const filteredProducts = products
    ? products.filter(
        (product: any) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

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
            <Button className="inline-flex items-center" onClick={handleAddProduct}>
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
                <TableHead>Vendor</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <LoadingSpinner />
                    <div className="mt-2">Loading products...</div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-red-500">
                    Error loading products. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No products found. {searchQuery && "Try a different search term."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                          <Package className="h-4 w-4" />
                        </div>
                        {product.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.vendorName || (product.vendorId ? `Vendor ${product.vendorId}` : "N/A")}
                    </TableCell>
                    <TableCell>{product.sku || "N/A"}</TableCell>
                    <TableCell>₹{formatCurrency(product.price)}</TableCell>
                    <TableCell>{product.tax || 0}%</TableCell>
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
                          <DropdownMenuItem onClick={() => handleViewDetails(product)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleActivation(product)}>
                            {product.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(product)}>
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600" 
                            onClick={() => handleDelete(product)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialogs */}
        {selectedProduct && (
          <>
            <ProductDetailDialog 
              product={selectedProduct} 
              isOpen={isDetailDialogOpen} 
              onClose={() => setIsDetailDialogOpen(false)} 
            />
            
            <ProductDeleteDialog
              productId={selectedProduct.id}
              productName={selectedProduct.name}
              isOpen={isDeleteDialogOpen}
              onClose={() => setIsDeleteDialogOpen(false)}
            />
          </>
        )}
        
        <ProductFormDialog 
          initialData={selectedProduct}
          isOpen={isFormDialogOpen} 
          onClose={() => setIsFormDialogOpen(false)}
          mode={formMode}
        />
      </div>
    </DashboardLayout>
  );
}
