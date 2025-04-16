import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  createSale, 
  getCustomers, 
  getProducts, 
  Customer,
  Product
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "../../contexts/AuthContext";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

// Form schema
const formSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  date: z.string(),
  paymentMethod: z.enum(["cash", "credit_card", "bank_transfer", "check"]),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, "Product is required"),
      quantity: z.string().transform(val => parseInt(val) || 0),
      unitPrice: z.string().transform(val => parseFloat(val) || 0),
    })
  ).min(1, "At least one item is required"),
  discountAmount: z.string().transform(val => parseFloat(val) || 0),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateSale() {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { currentUser } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      date: new Date().toISOString().split('T')[0],
      paymentMethod: "cash",
      notes: "",
      items: [{ productId: "", quantity: "1", unitPrice: "0.00" }],
      discountAmount: "0.00",
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  // Fetch customers and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersData, productsData] = await Promise.all([
          getCustomers(),
          getProducts()
        ]);
        setCustomers(customersData);
        setProducts(productsData);
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
  
  // Watch for changes in form values to calculate totals
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.includes('items') || name === 'discountAmount') {
        calculateTotals();
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);
  
  // Find customer when customerId changes
  useEffect(() => {
    const customerId = form.watch('customerId');
    if (customerId) {
      const customer = customers.find(c => c.id === customerId);
      setSelectedCustomer(customer || null);
    } else {
      setSelectedCustomer(null);
    }
  }, [form.watch('customerId'), customers]);
  
  const calculateTotals = () => {
    const items = form.getValues().items;
    const discountAmount = parseFloat(form.getValues().discountAmount) || 0;
    
    let calculatedSubtotal = 0;
    
    items.forEach(item => {
      const quantity = parseInt(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      calculatedSubtotal += quantity * unitPrice;
    });
    
    setSubtotal(calculatedSubtotal);
    setTotal(Math.max(0, calculatedSubtotal - discountAmount));
  };
  
  // Auto-fill product price when product is selected
  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const items = form.getValues().items;
      items[index].unitPrice = String(product.price);
      form.setValue(`items.${index}.unitPrice`, String(product.price));
      calculateTotals();
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (data.items.some(item => parseInt(item.quantity) <= 0)) {
      toast({
        variant: "destructive",
        title: "Invalid quantity",
        description: "All item quantities must be greater than zero"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const saleItems = data.items.map(item => ({
        productId: item.productId,
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        totalPrice: parseInt(item.quantity) * parseFloat(item.unitPrice)
      }));
      
      await createSale({
        customerId: data.customerId,
        date: new Date(data.date),
        paymentMethod: data.paymentMethod,
        paymentStatus: "pending",
        notes: data.notes || "",
        subTotal: subtotal,
        discountAmount: parseFloat(data.discountAmount) || 0,
        totalAmount: total,
        createdBy: currentUser?.uid || "",
      }, saleItems);
      
      toast({
        title: "Sale created",
        description: "Sale has been created successfully"
      });
      
      setLocation("/sales");
    } catch (error) {
      console.error("Error creating sale:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create sale. Please try again."
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
          onClick={() => setLocation("/sales")}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Create Sale</h1>
          <p className="text-sm text-gray-500">Create a new sales invoice</p>
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
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="credit_card">Credit Card</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Products</CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => append({ productId: "", quantity: "1", unitPrice: "0.00" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex flex-col space-y-4">
                    {index > 0 && <div className="h-px bg-gray-200 w-full my-2"></div>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-5">
                        <FormField
                          control={form.control}
                          name={`items.${index}.productId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handleProductChange(index, value);
                                }} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select product" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {products.map(product => (
                                    <SelectItem key={product.id} value={product.id}>
                                      {product.name} {product.colorOrBatch ? `(${product.colorOrBatch})` : ''}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  step="1" 
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
                      </div>
                      
                      <div className="md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit Price</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01" 
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
                      </div>
                      
                      <div className="md:col-span-1 flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={fields.length <= 1}
                          onClick={() => {
                            remove(index);
                            calculateTotals();
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-600">Discount:</span>
                      <div className="w-32">
                        <FormField
                          control={form.control}
                          name="discountAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01" 
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
                      </div>
                    </div>
                    
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-semibold text-gray-900">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter any additional notes or information" 
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
              <CardFooter className="flex justify-end space-x-4 border-t pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation("/sales")}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Sale"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}
    </div>
  );
}
