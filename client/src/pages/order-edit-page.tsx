import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  PackageOpen,
  Building,
  User,
  Calendar,
  FileText,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

export default function OrderEditPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    orderNumber: "",
    status: "",
    notes: "",
    total: "",
    subtotal: "",
    tax: "",
    discount: "",
  });

  // Get order data
  const { data: order, isLoading: isLoadingOrder, error } = useQuery({
    queryKey: [`/api/orders/${id}`],
    enabled: !!id,
  });

  // Get companies and contacts for reference
  const { data: companies } = useQuery({
    queryKey: ["/api/companies"],
  });

  const { data: contacts } = useQuery({
    queryKey: ["/api/contacts"],
  });

  // Update mutation
  const updateOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order updated",
        description: "The order has been successfully updated.",
      });
      navigate("/orders");
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Populate form data when order is loaded
  useEffect(() => {
    if (order) {
      setFormData({
        orderNumber: order.orderNumber || "",
        status: order.status || "",
        notes: order.notes || "",
        total: order.total || "",
        subtotal: order.subtotal || "",
        tax: order.tax || "",
        discount: order.discount || "",
      });
    }
  }, [order]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleStatusChange = (value: string) => {
    setFormData({
      ...formData,
      status: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrderMutation.mutateAsync(formData);
  };

  if (isLoadingOrder) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <Button variant="outline" onClick={() => navigate("/orders")} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Order</CardTitle>
              <CardDescription>
                There was a problem loading the order data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{(error as Error).message || "Unknown error occurred"}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/orders")}>Return to Orders List</Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Find company and contact information
  const company = Array.isArray(companies?.data) 
    ? companies.data.find((c: any) => c.id === order?.companyId) 
    : null;
  const contact = Array.isArray(contacts?.data) 
    ? contacts.data.find((c: any) => c.id === order?.contactId) 
    : null;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" onClick={() => navigate("/orders")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                <PackageOpen className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Edit Order {order?.orderNumber}</CardTitle>
                <CardDescription>
                  Update the order details and status
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input
                    id="orderNumber"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    name="status" 
                    value={formData.status} 
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any additional notes about this order"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subtotal">Subtotal (₹)</Label>
                  <Input
                    id="subtotal"
                    name="subtotal"
                    value={formData.subtotal}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total">Total (₹)</Label>
                  <Input
                    id="total"
                    name="total"
                    value={formData.total}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax">Tax (₹)</Label>
                  <Input
                    id="tax"
                    name="tax"
                    value={formData.tax}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (₹)</Label>
                  <Input
                    id="discount"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
              </div>

              {/* Reference Information */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-medium">Reference Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-slate-400" />
                    <div>
                      <span className="text-xs text-slate-400">Company</span>
                      <p className="text-sm">{company?.name || "Not Available"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <div>
                      <span className="text-xs text-slate-400">Contact</span>
                      <p className="text-sm">{contact ? `${contact.firstName} ${contact.lastName}` : "Not Available"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                      <span className="text-xs text-slate-400">Order Date</span>
                      <p className="text-sm">{order?.orderDate ? format(new Date(order.orderDate), 'PPP') : "Not Available"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <div>
                      <span className="text-xs text-slate-400">Quotation Number</span>
                      <p className="text-sm">{order?.quotationNumber || "Not Available"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/orders")}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={updateOrderMutation.isPending}
            >
              {updateOrderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}