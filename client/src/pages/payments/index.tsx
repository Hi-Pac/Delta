import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPayments, getCustomers, Payment } from "../../lib/firebase";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Payments() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['/api/payments'],
    queryFn: async () => {
      return getPayments();
    }
  });
  
  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['/api/customers'],
    queryFn: async () => {
      return getCustomers();
    }
  });
  
  const isLoading = isLoadingPayments || isLoadingCustomers;
  
  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: "Cash",
      credit_card: "Credit Card",
      bank_transfer: "Bank Transfer",
      check: "Check"
    };
    return methods[method] || method;
  };

  const columns = [
    {
      header: "Date",
      accessor: (row: Payment) => format(row.date, "MMM dd, yyyy"),
    },
    {
      header: "Invoice",
      accessor: "saleId",
    },
    {
      header: "Amount",
      accessor: (row: Payment) => `$${row.amount.toFixed(2)}`,
      className: "font-medium"
    },
    {
      header: "Payment Method",
      accessor: (row: Payment) => getPaymentMethodLabel(row.paymentMethod),
    },
    {
      header: "Reference",
      accessor: (row: Payment) => row.reference || "—",
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500">Track all payment transactions</p>
        </div>
      </div>
      
      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <DataTable 
              data={payments || []}
              columns={columns}
              searchField="reference"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
