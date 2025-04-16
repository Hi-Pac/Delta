import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  createReturn, 
  getCustomers, 
  getSales,
  getSale,
  Customer,
  Sale,
  SaleItem
} from "../../lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "../../contexts/AuthContext";
import { ArrowLeft, X } from "lucide-react";

// Form schema
const formSchema = z.object({
  saleId: z.string().min(1, "Sale invoice is required"),
  customerId: z.string().min(1, "Customer is required"),
  date: z.string(),
  reason: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, "Product is required"),
      productName: z.string().optional(),
      quantity: z.string().transform(val => parseInt(val) || 0),
      maxQuantity: z.number().optional(),
      unitPrice: z.string().transform(val => parseFloat(val) || 0),
      selected: z.boolean().default(false),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateReturn() {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { currentUser } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      saleId: "",
      customerId: "",
      date: new Date().toISOString().split('T')[0],
      reason: "",
      items: [],
    },
  });
  
  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  // Fetch customers and sales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersData, salesData] = await Promise.all([
          getCustomers(),
          getSales()
        ]);
        setCustomers(customersData);
        setSales(salesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load necessary data"
        });
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Watch for changes to calculate totals
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.includes('items')) {
        calculateTotal();
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);
  
  // When sale changes, fetch its items
  useEffect(() => {
    const saleId = form.watch('saleId');
    if (!saleId) {
      setSaleItems([]);
      replace([]);
      return;
    }
    
    const fetchSaleItems = async () => {
      try {
        const sale = await getSale(saleId);
        if (sale) {
          setSaleItems(sale.items);
          form.setValue('customerId', sale.customerId);
          
          // Map sale items to form items
          const formItems = sale.items.map(item => ({
            productId: item.productId,
            productName: item.product?.name || '',
            quantity: "0",
            maxQuantity: item.quantity,
            unitPrice: String(item.unitPrice),
            selected: false,
          }));
          
          replace(formItems);
        }
      } catch (error) {
        console.error("Error fetching sale items:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load sale details"
        });
      }
    };
    
    fetchSaleItems();
  }, [form.watch('saleId'), replace, form, toast]);
  
  const calculateTotal = () => {
    const items = form.getValues().items;
    let total = 0;
    
    items.forEach(item => {
      if (item.selected) {
        const quantity = parseInt(item.quantity) || 0;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        total += quantity * unitPrice;
      }
    });
    
    setTotalAmount(total);
  };
  
  const handleItemSelection = (index: number, selected: boolean) => {
    form.setValue(`items.${index}.selected`, selected);
    if (!selected) {
      form.setValue(`items.${index}.quantity`, "0");
    }
    calculateTotal();
  };

  const onSubmit = async (data: FormValues) => {
    const selectedItems = data.items.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      toast({
        variant: "destructive",
        title: "No items selected",
        description: "Please select at least one item to return"
      });
      return;
    }
    
    if (selectedItems.some(item => parseInt(item.quantity) <= 0)) {
      toast({
        variant: "destructive",
        title: "Invalid quantity",
        description: "All selected items must have a quantity greater than zero"
      });
      return;
    }
    
    if (selectedItems.some(item => item.maxQuantity && parseInt(item.quantity) > item.maxQuantity)) {
      toast({
        variant: "destructive",
        title: "Invalid quantity",
        description: "Return quantity cannot exceed original purchase quantity"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const returnItems = selectedItems.map(item => ({
        productId: item.productId,
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        totalPrice: parseInt(item.quantity) * parseFloat(item.unitPrice)
      }));
      
      await createReturn({
        saleId: data.saleId,
        customerId: data.customerId,
        date: new Date(data.date),
        reason: data.reason || "",
        totalAmount: totalAmount,
        createdBy: currentUser?.uid || "",
      }, returnItems);
      
      toast({
        title: "Return created",
        description: "Return has been created successfully"
      });
      
      setLocation("/returns");
    } catch (error) {
      console.error("Error creating return:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create return. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation("/returns")}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Create Return</h1>
          <p className="text-sm text-gray-500">Process a product return from a customer</p>
        </div>
      </div>

      {loadingData ? (
        <div className="space-y-6">
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Return Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="saleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Sale</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select invoice" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sales.map(sale => (
                              <SelectItem key={sale.id} value={sale.id}>
                                {sale.invoiceNumber}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map(customer => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Reason</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter reason for return" 
                          className="resize-none" 
                          rows={3}
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
                <CardTitle>Return Items</CardTitle>
              </CardHeader>
              <CardContent>
                {fields.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Select a sale invoice to view items</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 font-medium text-gray-500 text-sm">
                      <div className="col-span-1"></div>
                      <div className="col-span-5">Product</div>
                      <div className="col-span-2">Original Qty</div>
                      <div className="col-span-2">Return Qty</div>
                      <div className="col-span-2">Unit Price</div>
                    </div>
                    
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-12 gap-4 items-center border-b border-gray-100 pb-4">
                        <div className="col-span-1">
                          <FormField
                            control={form.control}
                            name={`items.${index}.selected`}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      handleItemSelection(index, !!checked);
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="col-span-5">
                          <p className="font-medium truncate">{field.productName}</p>
                          <FormField
                            control={form.control}
                            name={`items.${index}.productId`}
                            render={({ field }) => (
                              <input type="hidden" {...field} />
                            )}
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <p>{field.maxQuantity}</p>
                        </div>
                        
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="0" 
                                    max={form.getValues().items[index].maxQuantity}
                                    {...field}
                                    disabled={!form.getValues().items[index].selected}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="0" 
                                    step="0.01" 
                                    readOnly 
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-end pt-4">
                      <div className="w-48">
                        <div className="flex justify-between font-medium">
                          <span>Total Amount:</span>
                          <span>${totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end space-x-4 border-t pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation("/returns")}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Processing..." : "Process Return"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}
    </div>
  );
}
