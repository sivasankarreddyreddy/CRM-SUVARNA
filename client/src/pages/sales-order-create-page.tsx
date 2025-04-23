import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, FileText, Building, User, CalendarClock, DollarSign, ClipboardCheck } from "lucide-react";

// Form schema with validation
const salesOrderFormSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  quotationId: z.number().optional(),
  opportunityId: z.number().optional(),
  companyId: z.number().optional(),
  contactId: z.number().optional(),
  subtotal: z.string().min(1, "Subtotal is required"),
  tax: z.string().optional(),
  discount: z.string().optional(),
  total: z.string().min(1, "Total is required"),
  status: z.string().default("pending"),
  orderDate: z.string().optional(),
  notes: z.string().optional(),
});

type SalesOrderFormValues = z.infer<typeof salesOrderFormSchema>;

export default function SalesOrderCreatePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchParams] = useRoute("/orders/new");
  
  // Parse quotation ID from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const quotationId = urlParams.get("quotationId") ? parseInt(urlParams.get("quotationId")!) : undefined;
  
  const [items, setItems] = useState<any[]>([]);
  
  // Fetch quotation details if quotationId is provided
  const { data: quotation } = useQuery({
    queryKey: [`/api/quotations/${quotationId}`],
    queryFn: async () => {
      if (!quotationId) return null;
      const res = await apiRequest("GET", `/api/quotations/${quotationId}`);
      if (res.ok) {
        return await res.json();
      }
      return null;
    },
    enabled: !!quotationId,
  });
  
  // Fetch quotation items if quotationId is provided
  const { data: quotationItems } = useQuery({
    queryKey: [`/api/quotations/${quotationId}/items`],
    queryFn: async () => {
      if (!quotationId) return [];
      const res = await apiRequest("GET", `/api/quotations/${quotationId}/items`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    },
    enabled: !!quotationId,
  });
  
  // Initialize form
  const form = useForm<SalesOrderFormValues>({
    resolver: zodResolver(salesOrderFormSchema),
    defaultValues: {
      orderNumber: `SO-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      status: "pending",
      quotationId: quotationId,
      opportunityId: undefined,
      companyId: undefined,
      contactId: undefined,
      subtotal: "0.00",
      tax: "0.00",
      discount: "0.00",
      total: "0.00",
      orderDate: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });
  
  // Update form with quotation data when it's loaded
  useEffect(() => {
    if (quotation) {
      form.setValue("quotationId", quotation.id);
      form.setValue("opportunityId", quotation.opportunityId);
      form.setValue("companyId", quotation.companyId);
      form.setValue("contactId", quotation.contactId);
      form.setValue("subtotal", quotation.subtotal);
      form.setValue("tax", quotation.tax || "0.00");
      form.setValue("discount", quotation.discount || "0.00");
      form.setValue("total", quotation.total);
      form.setValue("notes", `Based on quotation #${quotation.quotationNumber}. ${quotation.notes || ''}`);
    }
  }, [quotation, form]);
  
  // Update items when quotation items are loaded
  useEffect(() => {
    if (quotationItems && quotationItems.length > 0) {
      const mappedItems = quotationItems.map((item: any) => ({
        productId: item.productId,
        productName: item.productName || "Product",
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        tax: item.tax || "0.00",
        subtotal: item.subtotal,
      }));
      
      setItems(mappedItems);
    }
  }, [quotationItems]);
  
  // Create sales order mutation
  const createSalesOrderMutation = useMutation({
    mutationFn: async (data: SalesOrderFormValues) => {
      const res = await apiRequest("POST", "/api/salesOrders", data);
      if (!res.ok) {
        throw new Error("Failed to create sales order");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Sales order created successfully",
      });
      
      // Create sales order items
      if (items.length > 0) {
        createSalesOrderItems(data.id);
      } else {
        navigate("/orders");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create sales order: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  // Create sales order items mutation
  const createSalesOrderItems = async (salesOrderId: number) => {
    try {
      for (const item of items) {
        await apiRequest("POST", "/api/salesOrders/" + salesOrderId + "/items", {
          salesOrderId,
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          tax: item.tax || "0.00",
          subtotal: item.subtotal,
        });
      }
      
      toast({
        title: "Success",
        description: "Sales order items added successfully",
      });
      
      // Update quotation status to "accepted" if it exists
      if (quotationId) {
        await apiRequest("PATCH", `/api/quotations/${quotationId}`, { status: "accepted" });
      }
      
      navigate("/orders");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add sales order items: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };
  
  // Handle form submission
  const onSubmit = (data: SalesOrderFormValues) => {
    createSalesOrderMutation.mutate(data);
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate("/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create Sales Order</h1>
            <p className="text-sm text-slate-500 mt-1">
              {quotation ? `Converting quotation #${quotation.quotationNumber} to sales order` : "Create a new sales order"}
            </p>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Order Details</CardTitle>
                    <CardDescription>Enter the details for this sales order</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="orderNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Number*</FormLabel>
                            <FormControl>
                              <Input placeholder="SO-2023-001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="orderDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Date</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <CalendarClock className="mr-2 h-4 w-4 text-slate-500" />
                                <Input type="date" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter any additional notes or special instructions"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                    <CardDescription>
                      {quotation ? "Items from the quotation" : "Add products to this order"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-[80px]">Qty</TableHead>
                            <TableHead className="w-[120px]">Unit Price</TableHead>
                            <TableHead className="w-[120px]">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-4 text-slate-500">
                                {quotation ? "No items in the quotation" : "No items added to this order"}
                              </TableCell>
                            </TableRow>
                          ) : (
                            items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <div className="font-medium">{item.productName}</div>
                                </TableCell>
                                <TableCell>
                                  <div>{item.description}</div>
                                </TableCell>
                                <TableCell>
                                  <div>{item.quantity}</div>
                                </TableCell>
                                <TableCell>
                                  <div>${parseFloat(item.unitPrice).toFixed(2)}</div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">${parseFloat(item.subtotal).toFixed(2)}</div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Right column */}
              <div className="space-y-6">
                {quotation && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Source Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-slate-500 mb-1">Quotation</div>
                        <div className="p-3 bg-slate-50 rounded-md border flex items-center">
                          <FileText className="h-4 w-4 text-slate-400 mr-2" />
                          <span>#{quotation.quotationNumber}</span>
                        </div>
                      </div>
                      
                      {quotation.opportunity && (
                        <div>
                          <div className="text-sm font-medium text-slate-500 mb-1">Opportunity</div>
                          <div className="p-3 bg-slate-50 rounded-md border flex items-center">
                            <DollarSign className="h-4 w-4 text-slate-400 mr-2" />
                            <span>{quotation.opportunity.name}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {quotation?.company && (
                      <div>
                        <div className="text-sm font-medium text-slate-500 mb-1">Company</div>
                        <div className="p-3 bg-slate-50 rounded-md border flex items-center">
                          <Building className="h-4 w-4 text-slate-400 mr-2" />
                          <span>{quotation.company.name}</span>
                        </div>
                      </div>
                    )}
                    
                    {quotation?.contact && (
                      <div>
                        <div className="text-sm font-medium text-slate-500 mb-1">Contact</div>
                        <div className="p-3 bg-slate-50 rounded-md border flex items-center">
                          <User className="h-4 w-4 text-slate-400 mr-2" />
                          <span>{quotation.contact.name}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-slate-600">Subtotal</span>
                      <FormField
                        control={form.control}
                        name="subtotal"
                        render={({ field }) => (
                          <div className="font-medium">
                            ${parseFloat(field.value).toFixed(2)}
                          </div>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-slate-600">Tax</span>
                      <FormField
                        control={form.control}
                        name="tax"
                        render={({ field }) => (
                          <div>
                            ${parseFloat(field.value || "0").toFixed(2)}
                          </div>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-slate-600">Discount</span>
                      <FormField
                        control={form.control}
                        name="discount"
                        render={({ field }) => (
                          <div>
                            ${parseFloat(field.value || "0").toFixed(2)}
                          </div>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 font-medium">
                      <span className="text-slate-900">Total</span>
                      <FormField
                        control={form.control}
                        name="total"
                        render={({ field }) => (
                          <div className="text-xl font-bold">
                            ${parseFloat(field.value).toFixed(2)}
                          </div>
                        )}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/orders")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createSalesOrderMutation.isPending}
                    >
                      {createSalesOrderMutation.isPending ? "Creating..." : "Create Order"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}