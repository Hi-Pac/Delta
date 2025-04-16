import { useQuery } from "@tanstack/react-query";
import { getRecentSales } from "../../lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Eye, MoreVertical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "wouter";

export function RecentSales() {
  const { data: sales, isLoading } = useQuery({
    queryKey: ['/api/recent-sales'],
    queryFn: async () => {
      return getRecentSales(5);
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
      accessor: (row: any) => row.customer?.name || "—",
    },
    {
      header: "Date",
      accessor: (row: any) => row.date ? format(row.date, "MMM dd, yyyy") : "—",
    },
    {
      header: "Amount",
      accessor: (row: any) => `$${row.totalAmount.toFixed(2)}`,
    },
    {
      header: "Status",
      accessor: (row: any) => (
        <StatusBadge status={row.paymentStatus} />
      ),
    },
  ];

  const renderActions = (row: any) => (
    <div className="flex justify-end items-center space-x-2">
      <Link href={`/sales/view/${row.id}`}>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
      <Button variant="ghost" size="icon">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Recent Sales</CardTitle>
        <Link href="/sales">
          <Button variant="ghost" className="text-sm text-primary">View All</Button>
        </Link>
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
            actions={renderActions}
            onRowClick={(row) => window.location.href = `/sales/view/${row.id}`}
          />
        )}
      </CardContent>
    </Card>
  );
}
