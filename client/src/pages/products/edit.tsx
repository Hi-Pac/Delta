import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getProduct, updateProduct } from "../../lib/firebase";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

// Form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.enum(["construction", "external_facades", "decorative"]),
  colorOrBatch: z.string().optional(),
  price: z.string().transform(val => parseFloat(val) || 0),
  stock: z.string().transform(val => parseInt(val) || 0),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditProduct({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "construction",
      colorOrBatch: "",
      price: "0.00",
      stock: "0",
    },
  });
  
  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const product = await getProduct(params.id);
        if (product) {
          form.reset({
            name: product.name,
            category: product.category,
            colorOrBatch: product.colorOrBatch || "",
            price: String(product.price),
            stock: String(product.stock),
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Product not found"
          });
          setLocation("/products");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load product data"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [params.id, form, toast, setLocation]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    
    try {
      await updateProduct(params.id, {
        name: data.name,
        category: data.category,
        colorOrBatch: data.colorOrBatch || "",
        price: data.price,
        stock: data.stock,
      });
      
      toast({
        title: "Product updated",
        description: "Product has been updated successfully"
      });
      
      setLocation("/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update product. Please try again."
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
          onClick={() => setLocation("/products")}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-500">Update product information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
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
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="construction">Construction</SelectItem>
                            <SelectItem value="external_facades">External Facades</SelectItem>
                            <SelectItem value="decorative">Decorative</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="colorOrBatch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color/Batch</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter color or batch number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01"
                            placeholder="Enter price" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="1"
                            placeholder="Enter stock quantity" 
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
                    onClick={() => setLocation("/products")}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Update Product"}
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
