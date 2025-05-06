import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface VendorDetailDialogProps {
  vendor: any;
  isOpen: boolean;
  onClose: () => void;
}

export function VendorDetailDialog({ vendor, isOpen, onClose }: VendorDetailDialogProps) {
  if (!vendor) return null;

  // Fetch products associated with this vendor
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products", { vendorId: vendor.id }],
    enabled: isOpen && !!vendor.id,
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            <span>Vendor Details</span>
            {vendor.isActive ? (
              <Badge variant="won" className="ml-2">Active</Badge>
            ) : (
              <Badge variant="secondary" className="ml-2">Inactive</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Complete information about this vendor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Vendor Name</h3>
                <p className="mt-1">{vendor.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Contact Person</h3>
                <p className="mt-1">{vendor.contactPerson || "N/A"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1">{vendor.email || "N/A"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1">{vendor.phone || "N/A"}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Website</h3>
              <p className="mt-1">
                {vendor.website ? (
                  <a 
                    href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {vendor.website}
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <p className="mt-1 whitespace-pre-wrap">{vendor.address || "N/A"}</p>
            </div>

            {vendor.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 whitespace-pre-wrap">{vendor.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created On</h3>
                <p className="mt-1">{formatDate(vendor.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Products from this vendor */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Products from this Vendor</h3>
            {isLoadingProducts ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Loading products...</span>
              </div>
            ) : !Array.isArray(products) || products.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No products associated with this vendor.</p>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
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