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
import { ArrowLeft, Plus, Trash2, Building, User, CalendarClock, DollarSign } from "lucide-react";

// Form schema with validation
const quotationFormSchema = z.object({
  quotationNumber: z.string().min(1, "Quotation number is required"),
  opportunityId: z.number().optional(),
  companyId: z.number().optional(),
  contactId: z.number().optional(),
  subtotal: z.string().min(1, "Subtotal is required"),
  tax: z.string().optional(),
  discount: z.string().optional(),
  total: z.string().min(1, "Total is required"),
  status: z.string().default("draft"),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
});

type QuotationFormValues = z.infer<typeof quotationFormSchema>;

export default function QuotationCreatePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchParams] = useRoute("/quotations/new");
  
  // Parse opportunity ID from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const opportunityId = urlParams.get("opportunityId") ? parseInt(urlParams.get("opportunityId")!) : undefined;
  
  const [items, setItems] = useState<any[]>([]);
  
  // Fetch opportunity details if opportunityId is provided
  const { data: opportunity } = useQuery({
    queryKey: [`/api/opportunities/${opportunityId}`],
    queryFn: async () => {
      if (!opportunityId) return null;
      const res = await apiRequest("GET", `/api/opportunities/${opportunityId}`);
      if (res.ok) {
        return await res.json();
      }
      return null;
    },
    enabled: !!opportunityId,
  });
  
  // Fetch products for quotation items
  const { data: products } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/products");
      if (res.ok) {
        return await res.json();
      }
      return [];
    },
  });
  
  // Initialize form
  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationFormSchema),
    defaultValues: {
      quotationNumber: `QT-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      status: "draft",
      opportunityId: opportunityId,
      companyId: undefined,
      contactId: undefined,
      subtotal: "0.00",
      tax: "0.00",
      discount: "0.00",
      total: "0.00",
      validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      notes: "",
    },
  });
  
  // Update form with opportunity data when it's loaded
  useEffect(() => {
    if (opportunity) {
      form.setValue("opportunityId", opportunity.id);
      form.setValue("companyId", opportunity.companyId);
      form.setValue("contactId", opportunity.contactId);
      form.setValue("subtotal", opportunity.value ? opportunity.value.toString() : "0.00");
      form.setValue("total", opportunity.value ? opportunity.value.toString() : "0.00");
      
      // Don't automatically add a default item - let the user choose
      if (products && products.length > 0 && items.length === 0) {
        // We'll just set up the form, but not add the item automatically
        // This allows the user to select the specific product they want
        form.setValue("subtotal", "0.00");
        form.setValue("total", "0.00");
      }
    }
  }, [opportunity, products, form]);
  
  // Create quotation mutation
  const createQuotationMutation = useMutation({
    mutationFn: async (data: QuotationFormValues) => {
      const res = await apiRequest("POST", "/api/quotations", data);
      if (!res.ok) {
        throw new Error("Failed to create quotation");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Quotation created successfully",
      });
      
      // Create quotation items
      if (items.length > 0) {
        createQuotationItems(data.id);
      } else {
        navigate("/quotations");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create quotation: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  // Create quotation items mutation
  const createQuotationItems = async (quotationId: number) => {
    try {
      for (const item of items) {
        await apiRequest("POST", "/api/quotations/" + quotationId + "/items", {
          quotationId,
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
        description: "Quotation items added successfully",
      });
      
      navigate("/quotations");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add quotation items: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };
  
  // Handle adding line items
  const handleAddItem = () => {
    if (!products || products.length === 0) return;
    
    // Start with a blank item with null product ID so the user must select one
    const newItem = {
      productId: "",  // Empty string will show "Select product" in dropdown
      productName: "",
      description: "Select a product from the dropdown",
      quantity: "1",  // Make sure these are strings to match the form inputs
      unitPrice: "0.00",
      tax: "0.00",
      subtotal: "0.00",
    };
    
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    updateTotals(updatedItems);
  };
  
  // Handle removing line items
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
    updateTotals(updatedItems);
  };
  
  // Handle updating item fields
  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate subtotal for this item
    if (field === "quantity" || field === "unitPrice") {
      const quantity = field === "quantity" ? parseFloat(value) : parseFloat(updatedItems[index].quantity);
      const unitPrice = field === "unitPrice" ? parseFloat(value) : parseFloat(updatedItems[index].unitPrice);
      updatedItems[index].subtotal = (quantity * unitPrice).toFixed(2);
    }
    
    setItems(updatedItems);
    updateTotals(updatedItems);
  };
  
  // Calculate totals based on items
  const updateTotals = (currentItems: any[]) => {
    const subtotal = currentItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2);
    form.setValue("subtotal", subtotal);
    
    // Get current tax and discount values
    const tax = form.getValues("tax") || "0.00";
    const discount = form.getValues("discount") || "0.00";
    
    // Calculate total
    const total = (
      parseFloat(subtotal) +
      parseFloat(tax) -
      parseFloat(discount)
    ).toFixed(2);
    
    form.setValue("total", total);
  };
  
  // Handle form submission
  const onSubmit = (data: QuotationFormValues) => {
    createQuotationMutation.mutate(data);
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate("/quotations")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quotations
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create New Quotation</h1>
            <p className="text-sm text-slate-500 mt-1">
              {opportunity ? `Based on opportunity: ${opportunity.name}` : "Create a new quotation from scratch"}
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
                    <CardTitle>Quotation Details</CardTitle>
                    <CardDescription>Enter the basic information for this quotation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="quotationNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quotation Number*</FormLabel>
                            <FormControl>
                              <Input placeholder="QT-2023-001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="validUntil"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valid Until</FormLabel>
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
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="sent">Sent</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
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
                              placeholder="Enter any additional notes or terms for this quotation"
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
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>Quotation Items</CardTitle>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                      </Button>
                    </div>
                    <CardDescription>Add products and services to this quotation</CardDescription>
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
                            <TableHead className="w-[60px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-4 text-slate-500">
                                No items added. Click "Add Item" to add products to this quotation.
                              </TableCell>
                            </TableRow>
                          ) : (
                            items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Select
                                    value={item.productId ? item.productId.toString() : ""}
                                    onValueChange={(value) => {
                                      const product = products.find(p => p.id.toString() === value);
                                      if (product) {
                                        handleItemChange(index, "productId", product.id);
                                        handleItemChange(index, "productName", product.name);
                                        handleItemChange(index, "description", product.description);
                                        handleItemChange(index, "unitPrice", product.price);
                                        handleItemChange(index, "subtotal", (parseFloat(product.price) * parseFloat(item.quantity)).toFixed(2));
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="border-0 p-0 h-auto font-medium truncate max-w-[200px]">
                                      <SelectValue placeholder="Select product">
                                        {item.productName || "Select product"}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {products && products.map((product) => (
                                        <SelectItem key={product.id} value={product.id.toString()}>
                                          {product.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={item.description}
                                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                    className="border-0 p-0 h-auto"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                    className="border-0 p-0 h-auto"
                                    min="1"
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <span className="mr-1">₹</span>
                                    <Input
                                      type="number"
                                      value={item.unitPrice}
                                      onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                                      className="border-0 p-0 h-auto"
                                      min="0"
                                      step="0.01"
                                    />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center font-medium">
                                    ₹{parseFloat(item.subtotal).toFixed(2)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveItem(index)}
                                  >
                                    <Trash2 className="h-4 w-4 text-slate-500" />
                                  </Button>
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
                <Card>
                  <CardHeader>
                    <CardTitle>Related To</CardTitle>
                    <CardDescription>Information about the related entities</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {opportunity && (
                      <div>
                        <div className="text-sm font-medium text-slate-500 mb-1">Opportunity</div>
                        <div className="p-3 bg-slate-50 rounded-md border flex items-center">
                          <DollarSign className="h-4 w-4 text-slate-400 mr-2" />
                          <span>{opportunity.name}</span>
                        </div>
                      </div>
                    )}
                    
                    {opportunity?.companyName && (
                      <div>
                        <div className="text-sm font-medium text-slate-500 mb-1">Company</div>
                        <div className="p-3 bg-slate-50 rounded-md border flex items-center">
                          <Building className="h-4 w-4 text-slate-400 mr-2" />
                          <span>{opportunity.companyName}</span>
                        </div>
                      </div>
                    )}
                    
                    {opportunity?.contactName && (
                      <div>
                        <div className="text-sm font-medium text-slate-500 mb-1">Contact</div>
                        <div className="p-3 bg-slate-50 rounded-md border flex items-center">
                          <User className="h-4 w-4 text-slate-400 mr-2" />
                          <span>{opportunity.contactName}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Quotation Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-slate-600">Subtotal</span>
                      <div className="flex items-center">
                        <span className="mr-1">₹</span>
                        <FormField
                          control={form.control}
                          name="subtotal"
                          render={({ field }) => (
                            <FormControl>
                              <Input
                                type="number"
                                className="border-0 p-0 h-auto text-right w-24"
                                {...field}
                                min="0"
                                step="0.01"
                                disabled
                              />
                            </FormControl>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-slate-600">Tax</span>
                      <div className="flex items-center">
                        <span className="mr-1">₹</span>
                        <FormField
                          control={form.control}
                          name="tax"
                          render={({ field }) => (
                            <FormControl>
                              <Input
                                type="number"
                                className="border-0 p-0 h-auto text-right w-24"
                                {...field}
                                min="0"
                                step="0.01"
                                onChange={(e) => {
                                  field.onChange(e);
                                  const subtotal = form.getValues("subtotal");
                                  const discount = form.getValues("discount") || "0.00";
                                  const total = (
                                    parseFloat(subtotal) +
                                    parseFloat(e.target.value) -
                                    parseFloat(discount)
                                  ).toFixed(2);
                                  form.setValue("total", total);
                                }}
                              />
                            </FormControl>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-slate-600">Discount</span>
                      <div className="flex items-center">
                        <span className="mr-1">₹</span>
                        <FormField
                          control={form.control}
                          name="discount"
                          render={({ field }) => (
                            <FormControl>
                              <Input
                                type="number"
                                className="border-0 p-0 h-auto text-right w-24"
                                {...field}
                                min="0"
                                step="0.01"
                                onChange={(e) => {
                                  field.onChange(e);
                                  const subtotal = form.getValues("subtotal");
                                  const tax = form.getValues("tax") || "0.00";
                                  const total = (
                                    parseFloat(subtotal) +
                                    parseFloat(tax) -
                                    parseFloat(e.target.value)
                                  ).toFixed(2);
                                  form.setValue("total", total);
                                }}
                              />
                            </FormControl>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 font-medium">
                      <span className="text-slate-900">Total</span>
                      <div className="flex items-center">
                        <span className="mr-1">₹</span>
                        <FormField
                          control={form.control}
                          name="total"
                          render={({ field }) => (
                            <FormControl>
                              <Input
                                type="text"
                                className="border-0 p-0 h-auto text-right font-bold w-24"
                                {...field}
                                disabled
                              />
                            </FormControl>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/quotations")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createQuotationMutation.isPending}
                    >
                      {createQuotationMutation.isPending ? "Creating..." : "Create Quotation"}
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