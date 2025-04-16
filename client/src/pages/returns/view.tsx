import { useState, useEffect } from "react";
import { getReturn, getCustomer, getSale } from "../../lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft, Printer, Download } from "lucide-react";
import { format } from "date-fns";

export default function ViewReturn({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [returnData, setReturnData] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [originalSale, setOriginalSale] = useState<any>(null);
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const fetchReturnData = async () => {
      try {
        const returnDoc = await getReturn(params.id);
        if (returnDoc) {
          setReturnData(returnDoc);
          
          // Fetch customer data
          if (returnDoc.customerId) {
            const customerData = await getCustomer(returnDoc.customerId);
            setCustomer(customerData);
          }
          
          // Fetch original sale data
          if (returnDoc.saleId) {
            const saleData = await getSale(returnDoc.saleId);
            setOriginalSale(saleData);
          }
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Return not found"
          });
          setLocation("/returns");
        }
      } catch (error) {
        console.error("Error fetching return data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load return data"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchReturnData();
  }, [params.id, toast, setLocation]);

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
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">Return Details</h1>
          <p className="text-sm text-gray-500">
            {returnData && `Return #${returnData.returnNumber}`}
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
      ) : returnData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Return Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Return Number:</dt>
                    <dd>{returnData.returnNumber}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Original Invoice:</dt>
                    <dd>{originalSale?.invoiceNumber || '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Date:</dt>
                    <dd>{format(returnData.date, "MMM dd, yyyy")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Total Amount:</dt>
                    <dd>${returnData.totalAmount.toFixed(2)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                {customer && (
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-500">Name:</dt>
                      <dd>{customer.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-500">Type:</dt>
                      <dd className="capitalize">{customer.classification}</dd>
                    </div>
                    {customer.phone && (
                      <div className="flex justify-between">
                        <dt className="font-medium text-gray-500">Phone:</dt>
                        <dd>{customer.phone}</dd>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex justify-between">
                        <dt className="font-medium text-gray-500">Address:</dt>
                        <dd>{customer.address}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </CardContent>
            </Card>
            
            {returnData.reason && (
              <Card>
                <CardHeader>
                  <CardTitle>Return Reason</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{returnData.reason}</p>
                </CardContent>
              </Card>
            )}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Returned Items</CardTitle>
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
                  {returnData.items.map((item: any, index: number) => (
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
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-gray-500">Return not found</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setLocation("/returns")}
            >
              Go Back to Returns
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
