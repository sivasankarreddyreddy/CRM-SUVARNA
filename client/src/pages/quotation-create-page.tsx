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
import { ArrowLeft, Plus, Trash2, Building, User, CalendarClock, DollarSign, ChevronDown, Package } from "lucide-react";

// Form schema with validation
// Create a dynamic schema based on whether an opportunity is selected
const getQuotationFormSchema = (hasOpportunity: boolean) => {
  if (hasOpportunity) {
    // If an opportunity is selected, the company and contact are optional
    // because they'll be filled from the opportunity
    return z.object({
      quotationNumber: z.string().min(1, "Quotation number is required"),
      opportunityId: z.number(),
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
  } else {
    // If no opportunity is selected, company and contact are required
    return z.object({
      quotationNumber: z.string().min(1, "Quotation number is required"),
      opportunityId: z.number().optional(),
      companyId: z.number({required_error: "Company is required"}),
      contactId: z.number({required_error: "Contact is required"}),
      subtotal: z.string().min(1, "Subtotal is required"),
      tax: z.string().optional(),
      discount: z.string().optional(),
      total: z.string().min(1, "Total is required"),
      status: z.string().default("draft"),
      validUntil: z.string().optional(),
      notes: z.string().optional(),
    });
  }
};

// Since we're using a dynamic schema generator, define the form type
type QuotationFormValues = z.infer<ReturnType<typeof getQuotationFormSchema>>;

export default function QuotationCreatePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchParams] = useRoute("/quotations/new");
  
  // Parse opportunity ID and duplicate ID from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const opportunityId = urlParams.get("opportunityId") ? parseInt(urlParams.get("opportunityId")!) : undefined;
  const duplicateId = urlParams.get("duplicate") ? parseInt(urlParams.get("duplicate")!) : undefined;
  
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
  
  // Fetch quotation to duplicate if duplicateId is provided
  const { data: quotationToDuplicate, isSuccess: quotationFetchSuccess } = useQuery({
    queryKey: [`/api/quotations/${duplicateId}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/quotations/${duplicateId}`);
      if (res.ok) {
        return await res.json();
      }
      return null;
    },
    enabled: !!duplicateId && !isNaN(duplicateId),
  });
  
  // Fetch items of the quotation to duplicate
  const { data: itemsToDuplicate, isSuccess: itemsFetchSuccess } = useQuery({
    queryKey: [`/api/quotations/${duplicateId}/items`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/quotations/${duplicateId}/items`);
      if (res.ok) {
        return await res.json();
      }
      return null;
    },
    enabled: !!duplicateId && !isNaN(duplicateId),
  });
  
  // Fetch products for quotation items
  const { data: productsData } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/products");
      if (res.ok) {
        const productData = await res.json();
        console.log("Products fetched:", productData);
        return productData;
      }
      return [];
    },
  });
  
  // Module functionality has been removed
  
  // Handle both paginated response and direct array response
  const products = React.useMemo(() => {
    if (!productsData) return [];
    if (Array.isArray(productsData)) return productsData;
    if (productsData.data && Array.isArray(productsData.data)) return productsData.data;
    return [];
  }, [productsData]);
  
  // Fetch companies for selection
  const { data: companiesData } = useQuery({
    queryKey: ["/api/companies"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/companies");
      if (res.ok) {
        return await res.json();
      }
      return [];
    },
  });
  
  // Handle both paginated response and direct array response
  const companies = React.useMemo(() => {
    if (!companiesData) return [];
    if (Array.isArray(companiesData)) return companiesData;
    if (companiesData.data && Array.isArray(companiesData.data)) return companiesData.data;
    return [];
  }, [companiesData]);
  
  // Initialize form with dynamic schema based on whether opportunity is selected
  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(getQuotationFormSchema(!!opportunityId)),
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
  
  // Fetch contacts for selected company
  const selectedCompanyId = form.watch("companyId");
  const { data: contactsData } = useQuery({
    queryKey: ["/api/contacts", selectedCompanyId], 
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const res = await apiRequest("GET", `/api/contacts?companyId=${selectedCompanyId}`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    },
    enabled: !!selectedCompanyId,
  });
  
  // Handle both paginated response and direct array response
  const contacts = React.useMemo(() => {
    if (!contactsData) return [];
    if (Array.isArray(contactsData)) return contactsData;
    if (contactsData.data && Array.isArray(contactsData.data)) return contactsData.data;
    return [];
  }, [contactsData]);
  
  // Update form with opportunity data when it's loaded
  useEffect(() => {
    if (opportunity) {
      // Log the complete opportunity data for debugging
      console.log("Opportunity data loaded:", JSON.stringify(opportunity, null, 2));
      
      // Set values in the form
      form.setValue("opportunityId", opportunity.id);
      
      // Set company and contact IDs from opportunity if available
      if (opportunity.companyId) {
        console.log("Setting companyId from opportunity:", opportunity.companyId);
        // Force companyId as a number to ensure proper type
        const companyId = typeof opportunity.companyId === 'number' ? 
          opportunity.companyId : 
          parseInt(opportunity.companyId.toString());
        
        form.setValue("companyId", companyId);
        
        // Forcibly set the selectedCompanyId to trigger contact loading
        setTimeout(() => {
          const watchedCompanyId = form.getValues("companyId");
          console.log("After setValue, companyId is now:", watchedCompanyId);
          
          // If we're still not getting a proper company ID, try a different approach
          if (!watchedCompanyId && companies && companies.length > 0) {
            // Try to find the company by name if company data is available
            if (opportunity.company && companies.some((c: any) => c.name === opportunity.company.name)) {
              const matchedCompany = companies.find((c: any) => c.name === opportunity.company.name);
              console.log("Found company by name match:", matchedCompany);
              form.setValue("companyId", matchedCompany.id);
            } else if (companies.length > 0) {
              // Fallback: use the first company as a last resort
              console.log("Using first company as fallback:", companies[0]);
              form.setValue("companyId", companies[0].id);
            }
          }
        }, 100);
      } else if (companies && companies.length > 0) {
        // If opportunity doesn't have companyId but we know companies exist
        console.log("No companyId in opportunity, attempting to find by related data");
        
        // Try to look up by company name if it exists in the opportunity
        let foundCompany = null;
        
        if (opportunity.company && opportunity.company.name) {
          foundCompany = companies.find((c: any) => 
            c.name.toLowerCase() === opportunity.company.name.toLowerCase()
          );
          
          if (foundCompany) {
            console.log("Found company by direct name match:", foundCompany);
            form.setValue("companyId", foundCompany.id);
          }
        }
        
        // If we still don't have a company, use the first one as a fallback
        if (!foundCompany && companies.length > 0) {
          console.log("Using first company as fallback:", companies[0]);
          form.setValue("companyId", companies[0].id);
        }
      }
      
      // Handle contact selection with robust fallbacks
      setTimeout(() => {
        const currentCompanyId = form.getValues("companyId");
        console.log("Current companyId before setting contactId:", currentCompanyId);
        
        if (opportunity.contactId && contacts) {
          console.log("Setting contactId from opportunity:", opportunity.contactId);
          // Force contactId as a number
          const contactId = typeof opportunity.contactId === 'number' ? 
            opportunity.contactId : 
            parseInt(opportunity.contactId.toString());
          
          form.setValue("contactId", contactId);
          console.log("ContactId set to:", form.getValues("contactId"));
        } else if (contacts && contacts.length > 0) {
          // If there's no contactId in the opportunity but we have contacts available
          console.log("No contactId in opportunity, using first available contact:", contacts[0].id);
          form.setValue("contactId", contacts[0].id);
          console.log("ContactId set to first available contact:", form.getValues("contactId"));
        } else if (currentCompanyId) {
          // If we have a company ID but no contacts loaded yet, force a contact query
          console.log("No contacts loaded, but we have companyId. Will try to load contacts.");
          
          // We'll rely on the contacts query to load contacts based on the company
          // and another useEffect will pick the first contact
        }
      }, 300);
      
      // Set initial values for subtotal/total from opportunity value
      const oppValue = opportunity.value ? opportunity.value.toString() : "0.00";
      form.setValue("subtotal", oppValue);
      form.setValue("total", oppValue);
      
      // Forcibly trigger form refresh to ensure select components update
      setTimeout(() => {
        form.trigger();
        console.log("Form values after trigger:", form.getValues());
      }, 600);
    }
  }, [opportunity, companies, form]);
  
  // Handle contacts loading after company is selected
  useEffect(() => {
    if (contacts && contacts.length > 0) {
      const currentContactId = form.getValues("contactId");
      if (!currentContactId) {
        console.log("Contacts loaded but no contact selected. Using first contact:", contacts[0].id);
        form.setValue("contactId", contacts[0].id);
      }
    }
  }, [contacts, form]);
  
  // Update form with duplicated quotation data when it's loaded
  useEffect(() => {
    if (quotationToDuplicate && products) {
      // Generate a new quotation number to avoid duplication
      const newQuotationNumber = `QT-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      
      form.setValue("quotationNumber", newQuotationNumber);
      form.setValue("opportunityId", quotationToDuplicate.opportunityId);
      form.setValue("companyId", quotationToDuplicate.companyId);
      form.setValue("contactId", quotationToDuplicate.contactId);
      form.setValue("subtotal", quotationToDuplicate.subtotal ? quotationToDuplicate.subtotal.toString() : "0.00");
      form.setValue("tax", quotationToDuplicate.tax ? quotationToDuplicate.tax.toString() : "0.00");
      form.setValue("discount", quotationToDuplicate.discount ? quotationToDuplicate.discount.toString() : "0.00");
      form.setValue("total", quotationToDuplicate.total ? quotationToDuplicate.total.toString() : "0.00");
      form.setValue("status", "draft"); // Always set as draft for duplicated quotations
      form.setValue("notes", quotationToDuplicate.notes || "");
      
      // Set valid until to one month from today
      form.setValue("validUntil", new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]);
      
      // Toast notification
      toast({
        title: "Quotation Duplicated",
        description: "The quotation has been duplicated. You can now edit it before saving.",
      });
    }
  }, [quotationToDuplicate, form, toast]);
  
  // Load duplicated quotation items
  useEffect(() => {
    if (itemsToDuplicate && itemsToDuplicate.length > 0 && products && products.length > 0) {
      console.log("Duplicating items:", itemsToDuplicate);
      console.log("Available products:", products);
      
      // Format the duplicated items to match our item structure
      const formattedItems = itemsToDuplicate.map((item: any) => {
        const product = products.find((p: any) => p.id === item.productId);
        console.log(`Processing item with productId ${item.productId}, found product:`, product);
        
        return {
          productId: item.productId,
          productName: product ? product.name : 'Product not found',
          description: item.description || (product ? product.description : ''),
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice,
          tax: item.tax || "0.00",
          subtotal: item.subtotal
        };
      });
      
      console.log("Formatted items for duplication:", formattedItems);
      setItems(formattedItems);
      
      // Calculate totals based on the items
      if (formattedItems.length > 0) {
        const subtotal = formattedItems.reduce(
          (sum, item) => sum + parseFloat(item.subtotal || "0"), 
          0
        ).toFixed(2);
        
        console.log("Calculated subtotal from duplicated items:", subtotal);
        form.setValue("subtotal", subtotal);
        form.setValue("total", subtotal); // Set initial total same as subtotal
        
        // Better than calling updateTotals which might rely on form values not yet set
        setTimeout(() => updateTotals(formattedItems), 0);
      }
    }
  }, [itemsToDuplicate, products, form]);
  
  // Create quotation mutation
  const createQuotationMutation = useMutation({
    mutationFn: async (data: QuotationFormValues) => {
      console.log("Submitting quotation data:", data);
      
      // Convert string fields to the correct types
      const formattedData = {
        quotationNumber: data.quotationNumber,
        opportunityId: data.opportunityId || undefined,
        companyId: data.companyId || undefined,
        contactId: data.contactId || undefined,
        subtotal: parseFloat(data.subtotal),
        tax: data.tax ? parseFloat(data.tax) : 0,
        discount: data.discount ? parseFloat(data.discount) : 0,
        total: parseFloat(data.total),
        status: data.status,
        validUntil: data.validUntil || undefined,
        notes: data.notes || "",
      };
      
      console.log("Raw form data from submission:", data);
      console.log("Formatted quotation data for API:", formattedData);
      console.log("Company ID type and value:", typeof data.companyId, data.companyId);
      console.log("Contact ID type and value:", typeof data.contactId, data.contactId);
      
      try {
        const res = await apiRequest("POST", "/api/quotations", formattedData);
        if (!res.ok) {
          // Try to get the error message from the response
          try {
            const errorData = await res.json();
            console.error("Detailed error from server:", errorData);
            throw new Error(errorData.details || errorData.error || errorData.message || "Failed to create quotation");
          } catch (e) {
            console.error("Error parsing error response:", e);
            throw new Error(`Failed to create quotation: ${res.status}`);
          }
        }
        return await res.json();
      } catch (error) {
        console.error("Quotation submission request error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Quotation created successfully",
      });
      
      // Invalidate the quotations query to ensure the list is refreshed
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      
      // Create quotation items
      if (items.length > 0) {
        createQuotationItems(data.id);
      } else {
        navigate("/quotations");
      }
    },
    onError: (error) => {
      console.error("Quotation creation error:", error);
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
      console.log("Creating quotation items for quotation ID:", quotationId);
      console.log("Items to create:", items);
      
      for (const item of items) {
        // Convert strings to numbers where needed
        const quantity = parseInt(item.quantity);
        const unitPrice = parseFloat(item.unitPrice);
        const subtotal = parseFloat(item.subtotal);
        const tax = item.tax ? parseFloat(item.tax) : 0;
        
        // Skip items with no product selected
        if (!item.productId) {
          console.log("Skipping item with no product selected");
          continue;
        }
        
        // Convert numeric values to strings as required by the backend schema
        const itemData = {
          quotationId,
          productId: item.productId,
          description: item.description || "",
          quantity: quantity,
          unitPrice: String(unitPrice),   // Convert to string
          tax: String(tax),               // Convert to string
          subtotal: String(subtotal)      // Convert to string
        };
        
        console.log("Sending quotation item data:", itemData);
        
        await apiRequest("POST", `/api/quotations/${quotationId}/items`, itemData);
      }
      
      toast({
        title: "Success",
        description: "Quotation items added successfully",
      });
      
      // Invalidate the quotations query to ensure the list is refreshed
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      
      navigate("/quotations");
    } catch (error) {
      console.error("Error creating quotation items:", error);
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
      productId: null,  // Use null to clearly indicate no selection
      productName: "",
      description: "Select a product from the dropdown",
      quantity: "1",  // Make sure these are strings to match the form inputs
      unitPrice: "0.00",
      tax: "0.00",
      subtotal: "0.00",
      isModule: false,
      parentProductId: null,
      moduleId: null,
    };
    
    // Use a functional update to ensure we're working with the latest state
    setItems(currentItems => {
      const updatedItems = [...currentItems, newItem];
      updateTotals(updatedItems);
      return updatedItems;
    });
  };
  // Module functionality has been removed
  
  // Handle removing line items
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
    updateTotals(updatedItems);
  };
  
  // Handle updating item fields
  const handleItemChange = (index: number, field: string, value: any) => {
    console.log(`Updating item at index ${index}, field: ${field}, value:`, value);
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate subtotal for this item
    if (field === "quantity" || field === "unitPrice") {
      const quantity = field === "quantity" ? parseFloat(value) : parseFloat(updatedItems[index].quantity);
      const unitPrice = field === "unitPrice" ? parseFloat(value) : parseFloat(updatedItems[index].unitPrice);
      updatedItems[index].subtotal = (quantity * unitPrice).toFixed(2);
    }
    
    console.log(`Updated items array:`, updatedItems);
    setItems(updatedItems);
    console.log(`After setItems, current items:`, items); // Note: This will show old state due to closure
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
  
  // Direct duplication method to ensure items are copied over
  const directDuplicateWithItems = async (sourceQuotationId: number, targetQuotationId: number) => {
    try {
      console.log(`Directly duplicating items from quotation ${sourceQuotationId} to ${targetQuotationId}`);
      
      // 1. Fetch items from the source quotation
      const response = await apiRequest("GET", `/api/quotations/${sourceQuotationId}/items`);
      if (!response.ok) {
        throw new Error(`Failed to fetch source quotation items: ${response.status}`);
      }
      
      const sourceItems = await response.json();
      console.log("Source items to duplicate:", sourceItems);
      
      if (!sourceItems || sourceItems.length === 0) {
        console.log("No items to duplicate");
        return;
      }
      
      // 2. Create each item for the target quotation
      for (const item of sourceItems) {
        const itemData = {
          quotationId: targetQuotationId,
          productId: item.productId,
          moduleId: item.moduleId || null,
          description: item.description || "",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          tax: item.tax || "0",
          subtotal: item.subtotal
        };
        
        console.log("Creating duplicate item:", itemData);
        
        const itemResponse = await apiRequest(
          "POST", 
          `/api/quotations/${targetQuotationId}/items`, 
          itemData
        );
        
        if (!itemResponse.ok) {
          console.error(`Failed to create item: ${itemResponse.status}`);
        } else {
          console.log("Item created successfully");
        }
      }
      
      console.log("All items duplicated successfully");
      
      // 3. Update the UI
      toast({
        title: "Success",
        description: `Duplicated ${sourceItems.length} items from the original quotation`,
      });
      
    } catch (error) {
      console.error("Error during direct duplication:", error);
      toast({
        title: "Error",
        description: `Failed to duplicate items: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };
  
  // Handle form submission
  const onSubmit = (data: QuotationFormValues) => {
    console.log("Form submitted with data:", data);
    console.log("Current items:", items);
    
    // Special handling for opportunity-based quotations
    // This ensures company and contact are properly set from the opportunity
    let formData = data;
    if (opportunity) {
      console.log("Submitting from opportunity context - opportunity data:", opportunity);
      formData = {
        ...data,
        opportunityId: opportunity.id,
        // Force company and contact from opportunity data
        companyId: opportunity.companyId,
        contactId: opportunity.contactId,
      };
      console.log("Enhanced form data with forced opportunity details:", formData);
    }
    
    // If this is a duplication, make sure we have our items ready
    if (duplicateId && items.length === 0 && itemsToDuplicate && itemsToDuplicate.length > 0) {
      toast({
        title: "Processing",
        description: "Preparing quotation items, please try submitting again in a moment.",
      });
      return;
    }
    
    // Special case for duplication to ensure items are copied
    if (duplicateId) {
      // Create the quotation first, then duplicate the items directly
      createQuotationMutation.mutate(formData, {
        onSuccess: (newQuotation) => {
          if (itemsToDuplicate && itemsToDuplicate.length > 0) {
            // Use direct API calls to duplicate items
            directDuplicateWithItems(parseInt(duplicateId), newQuotation.id);
          }
          
          // Invalidate the quotations query to ensure the list is refreshed
          queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
          
          // Navigate to the quotations list
          navigate("/quotations");
        }
      });
    } else {
      // Normal flow for non-duplication
      createQuotationMutation.mutate(formData);
    }
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
            <h1 className="text-2xl font-bold text-slate-900">
              {duplicateId ? "Duplicate Quotation" : "Create New Quotation"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {duplicateId 
                ? "Creating a copy of an existing quotation with a new number" 
                : opportunity 
                  ? `Based on opportunity: ${opportunity.name}` 
                  : "Create a new quotation from scratch"}
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {/* Company Selection Field - Required */}
                      <FormField
                        control={form.control}
                        name="companyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Building className="mr-1 h-4 w-4 text-slate-500" />
                              Company*
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(parseInt(value, 10));
                                // Reset contact when company changes
                                form.setValue("contactId", undefined as any);
                                // Force the form to update
                                form.trigger("companyId");
                                // Log selection for debugging
                                console.log("Company selection changed to:", value);
                              }}
                              value={field.value ? field.value.toString() : undefined}
                              disabled={!!opportunity}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select company" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {companies && companies.length > 0 ? (
                                  companies.map((company: any) => (
                                    <SelectItem key={company.id} value={company.id.toString()}>
                                      {company.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="loading_companies" disabled>
                                    Loading companies...
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {opportunity ? "Company is determined by selected opportunity" : "Select the company for this quotation"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Contact Selection Field - Required */}
                      <FormField
                        control={form.control}
                        name="contactId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <User className="mr-1 h-4 w-4 text-slate-500" />
                              Contact*
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(parseInt(value, 10));
                                // Force the form to update
                                form.trigger("contactId");
                                // Log selection for debugging
                                console.log("Contact selection changed to:", value);
                              }}
                              value={field.value ? field.value.toString() : undefined}
                              disabled={!!opportunity || !form.watch("companyId")}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select contact" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {form.watch("companyId") ? (
                                  contacts && contacts.length > 0 ? (
                                    contacts.map((contact: any) => (
                                      <SelectItem key={contact.id} value={contact.id.toString()}>
                                        {contact.firstName} {contact.lastName}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no-contacts" disabled>
                                      No contacts for this company
                                    </SelectItem>
                                  )
                                ) : (
                                  <SelectItem value="select-company" disabled>
                                    Select a company first
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {opportunity ? "Contact is determined by selected opportunity" : "Contact who will receive this quotation"}
                            </FormDescription>
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
                              <React.Fragment key={index}>
                                <TableRow>
                                  <TableCell>
                                    <div className="relative">
                                  <select
                                    className="w-full p-2 border rounded appearance-none"
                                    value={item.productId ? item.productId.toString() : ""}
                                    onChange={async (e) => {
                                      // Handle product selection change in one go
                                      const selectedId = e.target.value;
                                      
                                      if (!selectedId) return; // Don't do anything for empty selection
                                      
                                      // Check for duplicate items before proceeding
                                      const isDuplicate = items.some((existingItem, existingIndex) => 
                                        existingIndex !== index && 
                                        existingItem.productId?.toString() === selectedId
                                      );

                                      if (isDuplicate) {
                                        toast({
                                          title: "Duplicate product detected",
                                          description: "This product is already in the quotation. Please select a different product or update the existing item.",
                                          variant: "destructive",
                                        });
                                        
                                        // Reset the selection by not updating the state
                                        e.target.value = "";
                                        return;
                                      }
                                      
                                      // Find the selected product
                                      if (products && products.length > 0) {
                                        const selectedProduct = products.find(
                                          (p) => p.id.toString() === selectedId
                                        );
                                        
                                        if (selectedProduct) {
                                          // Create an updated copy of the items array
                                          const updatedItems = [...items];
                                          
                                          // Update all fields of this item at once
                                          updatedItems[index] = {
                                            ...updatedItems[index],
                                            productId: selectedProduct.id,
                                            productName: selectedProduct.name,
                                            description: selectedProduct.description || "",
                                            unitPrice: selectedProduct.price,
                                            subtotal: (
                                              parseFloat(selectedProduct.price) * 
                                              parseFloat(updatedItems[index].quantity || "1")
                                            ).toFixed(2)
                                          };
                                          
                                          // Update state with the new array (not individual fields)
                                          setItems(updatedItems);
                                          updateTotals(updatedItems);
                                          
                                          // Fetch modules for this product
                                          try {
                                            const modules = await fetchProductModules(selectedProduct.id);
                                            console.log(`Fetched ${modules.length} modules for product ${selectedProduct.id}`);
                                            
                                            // Store modules in state
                                            setSelectedProductModules(prev => ({
                                              ...prev,
                                              [index]: modules
                                            }));
                                          } catch (error) {
                                            console.error("Error fetching product modules:", error);
                                          }
                                        }
                                      }
                                    }}
                                  >
                                    <option value="">Select a product</option>
                                    {products && products.map((product) => (
                                      <option key={product.id} value={product.id.toString()}>
                                        {product.name}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                  </div>
                                </div>
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
                                
                                {/* Module functionality has been removed */}
                              </React.Fragment>
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