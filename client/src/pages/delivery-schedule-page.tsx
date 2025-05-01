import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Check, ChevronRight, Truck, AlertCircle, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define form schema for delivery scheduling
const formSchema = z.object({
  deliveryDate: z.date({
    required_error: "A delivery date is required",
  }),
  deliveryTime: z.string().min(1, "Delivery time is required"),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  deliveryContact: z.string().min(1, "Contact person is required"),
  deliveryPhone: z.string().min(1, "Contact phone is required"),
  specialInstructions: z.string().optional(),
  deliveryMethod: z.string().min(1, "Delivery method is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function DeliverySchedulePage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Fetch order details
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['/api/orders', id],
    enabled: !!id,
  });

  // Initialize form with defaults
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deliveryDate: new Date(),
      deliveryTime: "10:00",
      deliveryAddress: "",
      deliveryContact: "",
      deliveryPhone: "",
      specialInstructions: "",
      deliveryMethod: "standard",
    },
  });

  // Pre-populate address and contact information if available
  useEffect(() => {
    if (order) {
      form.setValue("deliveryAddress", order.companyAddress || "");
      form.setValue("deliveryContact", order.contactName || "");
      form.setValue("deliveryPhone", order.contactPhone || "");
    }
  }, [order, form]);

  // Handle form submission
  const deliveryMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", `/api/orders/${id}/deliveries`, {
        ...data,
        deliveryDate: format(data.deliveryDate, "yyyy-MM-dd"),
      });
      return response.json();
    },
    onSuccess: () => {
      // Update order status to "delivered"
      updateOrderMutation.mutate();
    },
    onError: (error: Error) => {
      toast({
        title: "Error scheduling delivery",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to update order status
  const updateOrderMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/orders/${id}`, {
        status: "delivered"
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Delivery scheduled",
        description: "The order has been marked for delivery.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders', id] });
      
      // Navigate back to orders page
      navigate("/orders");
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating order status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: FormValues) => {
    deliveryMutation.mutate(data);
  };

  const isSubmitting = deliveryMutation.isPending || updateOrderMutation.isPending;

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "processing":
        return <Badge variant="default">Processing</Badge>;
      case "quality_check":
        return <Badge variant="outline" className="text-amber-600 border-amber-600">Quality Check</Badge>;
      case "quality_passed":
        return <Badge variant="outline" className="text-emerald-600 border-emerald-600">Quality Check Passed</Badge>;
      case "delivered":
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Delivered</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Schedule Delivery</h1>
          <p className="mt-1 text-sm text-slate-500">Arrange the delivery for the quality-checked order</p>
        </div>

        {orderLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : order ? (
          <>
            {/* Order Summary Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order Summary</span>
                  {getStatusBadge(order.status)}
                </CardTitle>
                <CardDescription>Order #{order.orderNumber}</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Company</dt>
                    <dd className="mt-1 text-base">{order.companyName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Order Date</dt>
                    <dd className="mt-1 text-base">{new Date(order.orderDate).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Total Amount</dt>
                    <dd className="mt-1 text-base font-semibold">₹{order.total}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Product Count</dt>
                    <dd className="mt-1 text-base">{order.items?.length || 0} items</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Delivery Form */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
                <CardDescription>Enter the details for scheduling the delivery</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Delivery Date */}
                      <FormField
                        control={form.control}
                        name="deliveryDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Delivery Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              Select the date for delivery
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Delivery Time */}
                      <FormField
                        control={form.control}
                        name="deliveryTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Time</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select delivery time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="09:00">09:00 AM</SelectItem>
                                <SelectItem value="10:00">10:00 AM</SelectItem>
                                <SelectItem value="11:00">11:00 AM</SelectItem>
                                <SelectItem value="12:00">12:00 PM</SelectItem>
                                <SelectItem value="13:00">01:00 PM</SelectItem>
                                <SelectItem value="14:00">02:00 PM</SelectItem>
                                <SelectItem value="15:00">03:00 PM</SelectItem>
                                <SelectItem value="16:00">04:00 PM</SelectItem>
                                <SelectItem value="17:00">05:00 PM</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Choose a preferred time slot
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Delivery Method */}
                    <FormField
                      control={form.control}
                      name="deliveryMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select delivery method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard">Standard Delivery</SelectItem>
                              <SelectItem value="express">Express Delivery</SelectItem>
                              <SelectItem value="installation">Delivery with Installation</SelectItem>
                              <SelectItem value="special">Special Handling Required</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the appropriate delivery method
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Delivery Address */}
                    <FormField
                      control={form.control}
                      name="deliveryAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter the complete delivery address"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Provide the complete delivery address including building, street, city, state, and pincode
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Contact Person */}
                      <FormField
                        control={form.control}
                        name="deliveryContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Person</FormLabel>
                            <FormControl>
                              <Input placeholder="Name of person receiving the delivery" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Contact Phone */}
                      <FormField
                        control={form.control}
                        name="deliveryPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone number of the contact person" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Special Instructions */}
                    <FormField
                      control={form.control}
                      name="specialInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Instructions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any special delivery instructions..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Include any additional notes for the delivery team
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-end space-x-4 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => navigate("/orders")}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="inline-flex items-center"
                      >
                        {isSubmitting ? (
                          <>
                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Truck className="mr-2 h-4 w-4" />
                            Schedule Delivery
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
              <p className="text-slate-500 text-center mb-4">
                The order you're looking for could not be found or may have been deleted.
              </p>
              <Button onClick={() => navigate("/orders")}>
                Back to Orders
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}