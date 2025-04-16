import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReturns, Return } from "../../lib/firebase";
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
import { format } from "date-fns";

export default function Returns() {
  const [, setLocation] = useLocation();
  
  const { data: returns, isLoading } = useQuery({
    queryKey: ['/api/returns'],
    queryFn: async () => {
      return getReturns();
    }
  });

  const columns = [
    {
      header: "Return #",
      accessor: "returnNumber",
      className: "font-medium"
    },
    {
      header: "Invoice #",
      accessor: (row: Return) => row.saleId,
    },
    {
      header: "Customer",
      accessor: (row: Return) => row.customer?.name || "—",
    },
    {
      header: "Date",
      accessor: (row: Return) => format(row.date, "MMM dd, yyyy"),
    },
    {
      header: "Amount",
      accessor: (row: Return) => `$${row.totalAmount.toFixed(2)}`,
    },
  ];

  const renderActions = (returnItem: Return) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocation(`/returns/view/${returnItem.id}`)}>
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
          <h1 className="text-2xl font-semibold text-gray-900">Returns</h1>
          <p className="text-sm text-gray-500">Manage product returns</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/returns/create">
            <Button className="inline-flex items-center justify-center">
              <Plus className="mr-2 h-4 w-4" />
              Create New Return
            </Button>
          </Link>
        </div>
      </div>

      {/* Returns Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Returns</CardTitle>
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
              data={returns || []}
              columns={columns}
              searchField="returnNumber"
              actions={renderActions}
              onRowClick={(returnItem) => setLocation(`/returns/view/${returnItem.id}`)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
