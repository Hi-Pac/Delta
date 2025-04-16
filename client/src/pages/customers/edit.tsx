import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getCustomer, updateCustomer } from "../../lib/firebase";
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
import { ArrowLeft } from "lucide-react";

// Form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
  classification: z.enum(["institution", "store", "individual"]),
  discountPercentage: z.string().transform(val => parseFloat(val) || 0),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditCustomer({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      classification: "individual",
      discountPercentage: "0",
    },
  });
  
  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const customer = await getCustomer(params.id);
        if (customer) {
          form.reset({
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            classification: customer.classification,
            discountPercentage: String(customer.discountPercentage),
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Customer not found"
          });
          setLocation("/customers");
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load customer data"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomer();
  }, [params.id, form, toast, setLocation]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    
    try {
      await updateCustomer(params.id, {
        name: data.name,
        phone: data.phone || "",
        address: data.address || "",
        classification: data.classification,
        discountPercentage: data.discountPercentage,
      });
      
      toast({
        title: "Customer updated",
        description: "Customer has been updated successfully"
      });
      
      setLocation("/customers");
    } catch (error) {
      console.error("Error updating customer:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update customer. Please try again."
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
          onClick={() => setLocation("/customers")}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Customer</h1>
          <p className="text-sm text-gray-500">Update customer information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full md:col-span-2" />
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter customer name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="classification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="institution">Institution/Project</SelectItem>
                            <SelectItem value="store">Store</SelectItem>
                            <SelectItem value="individual">Individual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Percentage</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="100" 
                            step="0.5"
                            placeholder="Enter discount percentage" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter customer address" 
                            className="resize-none" 
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <CardFooter className="flex justify-end space-x-4 px-0">
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation("/customers")}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Update Customer"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
