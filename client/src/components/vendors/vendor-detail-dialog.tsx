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
import { Globe, Mail, Phone, MapPin, User } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface VendorDetailDialogProps {
  vendor: any;
  isOpen: boolean;
  onClose: () => void;
}

export function VendorDetailDialog({ vendor, isOpen, onClose }: VendorDetailDialogProps) {
  if (!vendor) return null;
  
  // Fetch associated products for this vendor
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/vendors", vendor.id, "products"],
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
            <div>
              <h3 className="text-sm font-medium text-gray-500">Vendor Name</h3>
              <p className="mt-1 text-lg font-semibold">{vendor.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendor.contactPerson && (
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Contact Person</h3>
                    <p className="mt-1">{vendor.contactPerson}</p>
                  </div>
                </div>
              )}

              {vendor.email && (
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1">
                      <a 
                        href={`mailto:${vendor.email}`} 
                        className="text-primary-600 hover:underline"
                      >
                        {vendor.email}
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendor.phone && (
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="mt-1">{vendor.phone}</p>
                  </div>
                </div>
              )}

              {vendor.website && (
                <div className="flex items-start">
                  <Globe className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Website</h3>
                    <p className="mt-1">
                      <a 
                        href={vendor.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        {vendor.website}
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {vendor.address && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Address</h3>
                  <p className="mt-1 whitespace-pre-wrap">{vendor.address}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created On</h3>
                <p className="mt-1">{formatDate(vendor.createdAt)}</p>
              </div>

              {vendor.updatedAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="mt-1">{formatDate(vendor.updatedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Products from this vendor */}
          <div>
            <h3 className="text-base font-medium mb-2">Products from this Vendor</h3>
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