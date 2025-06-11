import React, { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  TableFooter,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Plus, Trash } from "lucide-react";

// Define form schema for validation
const formSchema = z.object({
  quotationNumber: z.string().min(3, { message: "Quotation number is required" }),
  validUntil: z.string().optional(),
  status: z.string(),
  notes: z.string().optional(),
  subtotal: z.string(),
  tax: z.string().optional(),
  discount: z.string().optional(),
  total: z.string(),
  companyId: z.string().optional(),
  contactId: z.string().optional(),
  opportunityId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function QuotationEditPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [items, setItems] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({
    productId: "",
    moduleId: "",
    description: "",
    quantity: "1",
    unitPrice: "0",
    tax: "0",
    subtotal: "0",
  });
  
  const [availableModules, setAvailableModules] = useState<any[]>([]);

  // Fetch quotation details
  const { data: quotation, isLoading: isLoadingQuotation } = useQuery({
    queryKey: [`/api/quotations/${id}`],
  });

  // Fetch quotation items
  const { data: quotationItems, isLoading: isLoadingItems } = useQuery({
    queryKey: [`/api/quotations/${id}/items`],
  });
  
  // Update items when data is loaded
  useEffect(() => {
    if (quotationItems) {
      console.log("Quotation items loaded:", quotationItems);
      setItems(quotationItems);
    }
  }, [quotationItems]);

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });
  
  // We're using the state version of availableProducts instead of useMemo
  
  // Fetch companies
  const { data: companies } = useQuery({
    queryKey: ["/api/companies"],
  });
  
  // Fetch contacts
  const { data: contacts } = useQuery({
    queryKey: ["/api/contacts"],
  });
  
  // Fetch opportunities
  const { data: opportunities } = useQuery({
    queryKey: ["/api/opportunities"],
  });
  
  // Update product list when data is loaded
  useEffect(() => {
    if (products?.data && Array.isArray(products.data)) {
      console.log("Products loaded:", products.data);
      setAvailableProducts(products.data);
    }
  }, [products]);

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quotationNumber: "",
      validUntil: "",
      status: "draft",
      notes: "",
      subtotal: "0",
      tax: "0",
      discount: "0",
      total: "0",
    },
  });

  // Update form when quotation data is loaded
  useEffect(() => {
    if (quotation) {
      form.reset({
        quotationNumber: quotation.quotationNumber || "",
        validUntil: quotation.validUntil 
          ? new Date(quotation.validUntil).toISOString().split("T")[0]
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: quotation.status || "draft",
        notes: quotation.notes || "",
        subtotal: quotation.subtotal ? quotation.subtotal.toString() : "0",
        tax: quotation.tax ? quotation.tax.toString() : "0",
        discount: quotation.discount ? quotation.discount.toString() : "0",
        total: quotation.total ? quotation.total.toString() : "0",
        companyId: quotation.companyId ? quotation.companyId.toString() : "",
        contactId: quotation.contactId ? quotation.contactId.toString() : "",
        opportunityId: quotation.opportunityId ? quotation.opportunityId.toString() : "",
      });
    }
  }, [quotation, form]);

  // Calculate totals
  const calculateTotals = (currentItems: any[] = items) => {
    const subtotal = currentItems.reduce(
      (sum, item) => sum + parseFloat(item.subtotal || 0),
      0
    );
    const taxAmount = parseFloat(form.getValues("tax") || "0");
    const discountAmount = parseFloat(form.getValues("discount") || "0");
    const total = subtotal + taxAmount - discountAmount;

    form.setValue("subtotal", subtotal.toFixed(2));
    form.setValue("total", total.toFixed(2));
  };

  // Update quotation mutation
  const updateQuotationMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("PATCH", `/api/quotations/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quotations/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      toast({
        title: "Quotation updated",
        description: "The quotation has been successfully updated.",
      });
      navigate(`/quotations/${id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating quotation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (item: any) => {
      const res = await apiRequest(
        "POST",
        `/api/quotations/${id}/items`,
        item
      );
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/quotations/${id}/items`] });
      setItems([...items, data]);
      setNewItem({
        productId: "",
        description: "",
        quantity: "1",
        unitPrice: "0",
        tax: "0",
        subtotal: "0",
      });
      calculateTotals([...items, data]);
      toast({
        title: "Item added",
        description: "The item has been added to the quotation.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("DELETE", `/api/quotations/${id}/items/${itemId}`);
    },
    onSuccess: (_data, itemId) => {
      const updatedItems = items.filter((item) => item.id !== itemId);
      setItems(updatedItems);
      calculateTotals(updatedItems);
      queryClient.invalidateQueries({ queryKey: [`/api/quotations/${id}/items`] });
      toast({
        title: "Item deleted",
        description: "The item has been removed from the quotation.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: FormData) => {
    updateQuotationMutation.mutate(data);
  };

  // Handle product selection
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    if (!productId) return;

    // Check for duplicate immediately when product is selected
    const isDuplicate = items.some(item => 
      item.productId?.toString() === productId && 
      item.moduleId?.toString() === (newItem.moduleId || "")
    );

    if (isDuplicate) {
      toast({
        title: "Duplicate product detected",
        description: "This product with the same module is already in the quotation. Please select a different product or update the existing item.",
        variant: "destructive",
      });
      
      // Reset the selection
      setNewItem({
        ...newItem,
        productId: "",
        description: "",
        unitPrice: "0",
        subtotal: "0",
      });
      return;
    }

    const product = availableProducts.find((p) => p.id.toString() === productId);
    if (product) {
      setNewItem({
        ...newItem,
        productId,
        description: product.description || product.name,
        unitPrice: product.price.toString(),
        subtotal: (parseFloat(product.price) * parseFloat(newItem.quantity)).toFixed(2),
      });
    }
  };

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = e.target.value;
    const unitPrice = newItem.unitPrice;
    const subtotal = (parseFloat(quantity) * parseFloat(unitPrice)).toFixed(2);

    setNewItem({
      ...newItem,
      quantity,
      subtotal,
    });
  };

  // Handle module selection
  const handleModuleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const moduleId = e.target.value === "no-module" ? "" : e.target.value;
    
    // If a product is already selected, check for duplicates
    if (newItem.productId) {
      const isDuplicate = items.some(item => 
        item.productId?.toString() === newItem.productId && 
        item.moduleId?.toString() === (moduleId || "")
      );

      if (isDuplicate) {
        toast({
          title: "Duplicate combination detected",
          description: "This product with the selected module is already in the quotation. Please select a different module or update the existing item.",
          variant: "destructive",
        });
        
        // Reset module selection
        setNewItem({
          ...newItem,
          moduleId: "",
        });
        return;
      }
    }

    setNewItem({
      ...newItem,
      moduleId,
    });
  };

  // Handle unit price change
  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const unitPrice = e.target.value;
    const quantity = newItem.quantity;
    const subtotal = (parseFloat(quantity) * parseFloat(unitPrice)).toFixed(2);

    setNewItem({
      ...newItem,
      unitPrice,
      subtotal,
    });
  };

  // Add new item
  const handleAddItem = () => {
    if (!newItem.productId || !newItem.description || parseFloat(newItem.quantity) <= 0) {
      toast({
        title: "Validation error",
        description: "Please select a product and enter valid quantity.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate items (same product and module combination)
    const isDuplicate = items.some(item => 
      item.productId?.toString() === newItem.productId && 
      item.moduleId?.toString() === (newItem.moduleId || "")
    );

    if (isDuplicate) {
      toast({
        title: "Duplicate item",
        description: "This product with the same module is already added to the quotation. Please update the existing item quantity instead.",
        variant: "destructive",
      });
      return;
    }

    addItemMutation.mutate({
      quotationId: id,
      productId: newItem.productId,
      moduleId: newItem.moduleId || null,
      description: newItem.description,
      quantity: parseInt(newItem.quantity),
      unitPrice: newItem.unitPrice,
      tax: newItem.tax,
      subtotal: newItem.subtotal,
    });
  };

  // Delete item
  const handleDeleteItem = (itemId: number) => {
    if (confirm("Are you sure you want to remove this item?")) {
      deleteItemMutation.mutate(itemId);
    }
  };

  // Format currency
  const formatCurrency = (value: string) => {
    return `₹${parseFloat(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Loading state
  if (isLoadingQuotation || isLoadingItems) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="h-10 w-1/3 bg-slate-200 rounded mb-4"></div>
          <div className="h-6 w-2/3 bg-slate-200 rounded mb-6"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/quotations/${id}`)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Edit Quotation
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Update quotation details and items
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quotation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="quotationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quotation Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(companies?.data) ? companies.data.map((company) => (
                              <SelectItem key={company.id} value={company.id.toString()}>
                                {company.name}
                              </SelectItem>
                            )) : (
                              <SelectItem value="no-companies">No companies available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select contact" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(contacts?.data) ? contacts.data.map((contact) => (
                                <SelectItem key={contact.id} value={contact.id.toString()}>
                                  {contact.firstName} {contact.lastName}
                                </SelectItem>
                              )) : (
                                <SelectItem value="no-contacts">No contacts available</SelectItem>
                              )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="opportunityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opportunity</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            // Convert 'none' to empty value (null) for the database
                            field.onChange(value === 'none' ? null : value);
                          }}
                          value={field.value?.toString() || "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select opportunity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {Array.isArray(opportunities?.data) ? opportunities.data.map((opportunity) => (
                              <SelectItem key={opportunity.id} value={opportunity.id.toString()}>
                                {opportunity.name}
                              </SelectItem>
                            )) : null}
                          </SelectContent>
                        </Select>
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
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="viewed">Viewed</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subtotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtotal</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              calculateTotals();
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              calculateTotals();
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="total"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly className="font-bold" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Add any additional notes or terms here..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Quotation Items */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Quotation Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table className="mb-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="w-[100px] text-right">Qty</TableHead>
                      <TableHead className="w-[150px] text-right">Unit Price</TableHead>
                      <TableHead className="w-[100px] text-right">Tax</TableHead>
                      <TableHead className="w-[150px] text-right">Subtotal</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length > 0 ? (
                      items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">
                              {item.description || (
                                availableProducts?.find(p => p.id === item.productId)?.name || 
                                'Product #' + item.productId
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.tax || "0")}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.subtotal)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-slate-500">
                          No items added to this quotation
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  {items.length > 0 && (
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-medium">
                          Subtotal
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(form.getValues("subtotal"))}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>

                {/* Add Item Form */}
                <div className="border rounded-md p-4 mb-4">
                  <h3 className="text-sm font-medium mb-3">Add New Item</h3>
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="text-sm text-slate-500 block mb-1">
                        Product
                      </label>
                      <Select onValueChange={(value) => {
                        // Use the enhanced product change handler with duplicate validation
                        const fakeEvent = { target: { value } };
                        handleProductChange(fakeEvent as React.ChangeEvent<HTMLSelectElement>);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(availableProducts) ? availableProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name}
                            </SelectItem>
                          )) : (
                            <SelectItem value="no-products">No products available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-sm text-slate-500 block mb-1">
                        Module
                      </label>
                      <Select 
                        value={newItem.moduleId} 
                        onValueChange={(value) => {
                          const fakeEvent = { target: { value } };
                          handleModuleChange(fakeEvent as React.ChangeEvent<HTMLSelectElement>);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select module (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-module">No module</SelectItem>
                          {Array.isArray(availableModules) ? availableModules.map((module) => (
                            <SelectItem key={module.id} value={module.id.toString()}>
                              {module.name}
                            </SelectItem>
                          )) : null}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-sm text-slate-500 block mb-1">
                        Quantity
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={newItem.quantity}
                        onChange={handleQuantityChange}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-sm text-slate-500 block mb-1">
                        Unit Price
                      </label>
                      <Input
                        value={newItem.unitPrice}
                        onChange={handleUnitPriceChange}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-sm text-slate-500 block mb-1">
                        Tax
                      </label>
                      <Input
                        value={newItem.tax}
                        onChange={(e) => setNewItem({ ...newItem, tax: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-sm text-slate-500 block mb-1">
                        Subtotal
                      </label>
                      <Input value={newItem.subtotal} readOnly />
                    </div>
                  </div>
                  <div className="mt-2">
                    <Input
                      placeholder="Description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className="mb-2"
                    />
                    <Button
                      type="button"
                      onClick={handleAddItem}
                      disabled={!newItem.productId || !newItem.description}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(`/quotations/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}