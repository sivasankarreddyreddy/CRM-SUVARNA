import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Package2, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ModuleDetailDialogProps {
  module: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ModuleDetailDialog({ module, isOpen, onClose }: ModuleDetailDialogProps) {
  if (!module) return null;
  
  // Fetch associated products for this module
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/modules", module.id, "products"],
    enabled: isOpen && !!module.id,
  });

  // Format the date
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return "N/A";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            <span>Module Details</span>
            {module.isActive ? (
              <Badge variant="won" className="ml-2">Active</Badge>
            ) : (
              <Badge variant="secondary" className="ml-2">Inactive</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Complete information about this module
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Module Name</h3>
              <p className="mt-1 text-lg font-semibold">{module.name}</p>
            </div>

            {module.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 whitespace-pre-wrap">{module.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <Tag className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Price</h3>
                  <p className="mt-1 text-lg font-semibold">₹{module.price?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created On</h3>
                <p className="mt-1">{formatDate(module.createdAt)}</p>
              </div>

              {module.updatedAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="mt-1">{formatDate(module.updatedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Products containing this module */}
          <div>
            <h3 className="text-base font-medium mb-2">Products Using this Module</h3>
            {isLoadingProducts ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Loading products...</span>
              </div>
            ) : !Array.isArray(products) || products.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No products are using this module.</p>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(products) && products.map((product: any) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{product.price?.toLocaleString() || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.isActive ? (
                            <Badge variant="won">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}