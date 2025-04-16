import { useState, useEffect } from "react";
import { getSale, getPaymentsBySale, Customer, Sale, SaleItem, Payment, createPayment } from "../../lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "../../contexts/AuthContext";
import { ArrowLeft, Printer, FileText, Download, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger 
} from "@/components/ui/dialog";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Payment form schema
const paymentFormSchema = z.object({
  amount: z.string().transform(val => parseFloat(val) || 0),
  paymentMethod: z.enum(["cash", "credit_card", "bank_transfer", "check"]),
  reference: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export default function ViewSale({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [sale, setSale] = useState<Sale | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { currentUser } = useAuth();
  
  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: "",
      paymentMethod: "cash",
      reference: "",
    },
  });

  useEffect(() => {
    const fetchSaleData = async () => {
      try {
        const saleData = await getSale(params.id);
        if (saleData) {
          setSale(saleData);
          
          // Fetch payments related to this sale
          const paymentsData = await getPaymentsBySale(params.id);
          setPayments(paymentsData);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Sale not found"
          });
          setLocation("/sales");
        }
      } catch (error) {
        console.error("Error fetching sale data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load sale data"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSaleData();
  }, [params.id, toast, setLocation]);
  
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const balanceDue = sale ? sale.totalAmount - totalPaid : 0;
  
  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: "Cash",
      credit_card: "Credit Card",
      bank_transfer: "Bank Transfer",
      check: "Check"
    };
    return methods[method] || method;
  };
  
  const handleAddPayment = async (data: PaymentFormValues) => {
    if (!sale) return;
    
    if (data.amount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Payment amount must be greater than zero"
      });
      return;
    }
    
    if (data.amount > balanceDue) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Payment amount cannot exceed the balance due"
      });
      return;
    }
    
    setIsProcessingPayment(true);
    
    try {
      await createPayment({
        saleId: sale.id,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        date: new Date(),
        reference: data.reference || "",
        createdBy: currentUser?.uid || "",
      });
      
      toast({
        title: "Payment added",
        description: "Payment has been added successfully"
      });
      
      // Refresh payments
      const paymentsData = await getPaymentsBySale(params.id);
      setPayments(paymentsData);
      
      // Refresh sale data to get updated payment status
      const saleData = await getSale(params.id);
      if (saleData) {
        setSale(saleData);
      }
      
      setIsPaymentDialogOpen(false);
      paymentForm.reset();
    } catch (error) {
      console.error("Error adding payment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add payment. Please try again."
      });
    } finally {
      setIsProcessingPayment(false);
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
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">Sale Details</h1>
          <p className="text-sm text-gray-500">
            {sale && `Invoice #${sale.invoiceNumber}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : sale ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Invoice Number:</dt>
                    <dd>{sale.invoiceNumber}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Date:</dt>
                    <dd>{format(sale.date, "MMM dd, yyyy")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Payment Method:</dt>
                    <dd>{getPaymentMethodLabel(sale.paymentMethod)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Status:</dt>
                    <dd><StatusBadge status={sale.paymentStatus} /></dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                {sale.customer && (
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-500">Name:</dt>
                      <dd>{sale.customer.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-500">Type:</dt>
                      <dd className="capitalize">{sale.customer.classification}</dd>
                    </div>
                    {sale.customer.phone && (
                      <div className="flex justify-between">
                        <dt className="font-medium text-gray-500">Phone:</dt>
                        <dd>{sale.customer.phone}</dd>
                      </div>
                    )}
                    {sale.customer.address && (
                      <div className="flex justify-between">
                        <dt className="font-medium text-gray-500">Address:</dt>
                        <dd>{sale.customer.address}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Subtotal:</dt>
                    <dd>${sale.subTotal.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Discount:</dt>
                    <dd>${sale.discountAmount.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between font-medium">
                    <dt className="text-gray-500">Total:</dt>
                    <dd>${sale.totalAmount.toFixed(2)}</dd>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Paid Amount:</dt>
                    <dd className="text-green-600">${totalPaid.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between font-medium">
                    <dt className="text-gray-500">Balance Due:</dt>
                    <dd className={balanceDue > 0 ? "text-red-600" : "text-green-600"}>
                      ${balanceDue.toFixed(2)}
                    </dd>
                  </div>
                </dl>
                
                {balanceDue > 0 && (
                  <div className="mt-4">
                    <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Add Payment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Payment</DialogTitle>
                        </DialogHeader>
                        <Form {...paymentForm}>
                          <form onSubmit={paymentForm.handleSubmit(handleAddPayment)} className="space-y-4">
                            <FormField
                              control={paymentForm.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Amount</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="0.01" 
                                      max={balanceDue}
                                      step="0.01" 
                                      placeholder={`Max: $${balanceDue.toFixed(2)}`}
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={paymentForm.control}
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
                            
                            <FormField
                              control={paymentForm.control}
                              name="reference"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reference (Optional)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Enter reference number or description"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <DialogFooter>
                              <Button 
                                type="submit" 
                                disabled={isProcessingPayment}
                              >
                                {isProcessingPayment ? "Processing..." : "Add Payment"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.product?.name} {item.product?.colorOrBatch ? `(${item.product.colorOrBatch})` : ''}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{format(payment.date, "MMM dd, yyyy")}</TableCell>
                        <TableCell className="font-medium">${payment.amount.toFixed(2)}</TableCell>
                        <TableCell>{getPaymentMethodLabel(payment.paymentMethod)}</TableCell>
                        <TableCell>{payment.reference || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          
          {sale.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{sale.notes}</p>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-gray-500">Sale not found</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setLocation("/sales")}
            >
              Go Back to Sales
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
