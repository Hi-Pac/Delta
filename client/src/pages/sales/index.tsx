import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSales, Sale } from "../../lib/firebase";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MoreVertical, Plus, FileText, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";

export default function Sales() {
  const [, setLocation] = useLocation();
  
  const { data: sales, isLoading } = useQuery({
    queryKey: ['/api/sales'],
    queryFn: async () => {
      return getSales();
    }
  });

  const columns = [
    {
      header: "Invoice",
      accessor: "invoiceNumber",
      className: "font-medium"
    },
    {
      header: "Customer",
      accessor: (row: Sale) => row.customer?.name || "—",
    },
    {
      header: "Date",
      accessor: (row: Sale) => format(row.date, "MMM dd, yyyy"),
    },
    {
      header: "Amount",
      accessor: (row: Sale) => `$${row.totalAmount.toFixed(2)}`,
    },
    {
      header: "Payment Method",
      accessor: (row: Sale) => {
        const methods: Record<string, string> = {
          cash: "Cash",
          credit_card: "Credit Card",
          bank_transfer: "Bank Transfer",
          check: "Check"
        };
        return methods[row.paymentMethod] || row.paymentMethod;
      }
    },
    {
      header: "Status",
      accessor: (row: Sale) => (
        <StatusBadge status={row.paymentStatus} />
      ),
    },
  ];

  const renderActions = (sale: Sale) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocation(`/sales/view/${sale.id}`)}>
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FileText className="mr-2 h-4 w-4" />
          Print
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-semibold text-gray-900">Sales</h1>
          <p className="text-sm text-gray-500">Manage sales and invoices</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/sales/create">
            <Button className="inline-flex items-center justify-center">
              <Plus className="mr-2 h-4 w-4" />
              Create New Sale
            </Button>
          </Link>
        </div>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Sales</CardTitle>
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
              data={sales || []}
              columns={columns}
              searchField="invoiceNumber"
              actions={renderActions}
              onRowClick={(sale) => setLocation(`/sales/view/${sale.id}`)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
