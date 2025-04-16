import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCustomers, deleteCustomer, Customer } from "../../lib/firebase";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Edit, Trash2, MoreVertical, Plus, FileText, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { queryClient } from "@/lib/queryClient";

export default function Customers() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  
  const { data: customers, isLoading } = useQuery({
    queryKey: ['/api/customers'],
    queryFn: async () => {
      return getCustomers();
    }
  });

  const handleDelete = async () => {
    if (!customerToDelete) return;
    
    try {
      await deleteCustomer(customerToDelete.id);
      toast({
        title: "Customer deleted",
        description: `${customerToDelete.name} has been deleted successfully.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete customer. Please try again."
      });
    } finally {
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const confirmDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };
  
  const getClassificationLabel = (classification: string) => {
    switch (classification) {
      case 'institution': return 'Institution';
      case 'store': return 'Store';
      case 'individual': return 'Individual';
      default: return classification;
    }
  };
  
  const columns = [
    {
      header: "Name",
      accessor: "name",
      className: "font-medium"
    },
    {
      header: "Classification",
      accessor: (row: Customer) => getClassificationLabel(row.classification),
    },
    {
      header: "Phone",
      accessor: "phone",
    },
    {
      header: "Address",
      accessor: "address",
    },
    {
      header: "Discount",
      accessor: (row: Customer) => `${row.discountPercentage}%`,
    },
    {
      header: "Created",
      accessor: (row: Customer) => format(row.createdAt, "MMM dd, yyyy"),
    },
  ];

  const renderActions = (customer: Customer) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocation(`/customers/edit/${customer.id}`)}>
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocation(`/customers/edit/${customer.id}`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => confirmDelete(customer)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
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
          <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">Manage your customer database</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/customers/create">
            <Button className="inline-flex items-center justify-center">
              <Plus className="mr-2 h-4 w-4" />
              Add New Customer
            </Button>
          </Link>
        </div>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
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
              data={customers || []}
              columns={columns}
              searchField="name"
              actions={renderActions}
              onRowClick={(customer) => setLocation(`/customers/edit/${customer.id}`)}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer "{customerToDelete?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
