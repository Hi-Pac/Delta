import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts, deleteProduct, Product } from "../../lib/firebase";
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
import { Eye, Edit, Trash2, MoreVertical, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Products() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      return getProducts();
    }
  });

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProduct(productToDelete.id);
      toast({
        title: "Product deleted",
        description: `${productToDelete.name} has been deleted successfully.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product. Please try again."
      });
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };
  
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'construction': return 'Construction';
      case 'external_facades': return 'External Facades';
      case 'decorative': return 'Decorative';
      default: return category;
    }
  };
  
  const columns = [
    {
      header: "Name",
      accessor: "name",
      className: "font-medium"
    },
    {
      header: "Category",
      accessor: (row: Product) => getCategoryLabel(row.category),
    },
    {
      header: "Color/Batch",
      accessor: "colorOrBatch",
    },
    {
      header: "Price",
      accessor: (row: Product) => `$${row.price.toFixed(2)}`,
    },
    {
      header: "Stock",
      accessor: "stock",
    },
    {
      header: "Status",
      accessor: (row: Product) => {
        if (row.stock <= 0) return "Out of stock";
        if (row.stock < 10) return "Low stock";
        return "In stock";
      },
      className: (row: Product) => {
        if (row.stock <= 0) return "text-red-600";
        if (row.stock < 10) return "text-yellow-600";
        return "text-green-600";
      }
    },
  ];

  const renderActions = (product: Product) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocation(`/products/edit/${product.id}`)}>
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocation(`/products/edit/${product.id}`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => confirmDelete(product)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">Manage your product catalog</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/products/create">
            <Button className="inline-flex items-center justify-center">
              <Plus className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
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
              data={products || []}
              columns={columns}
              searchField="name"
              actions={renderActions}
              onRowClick={(product) => setLocation(`/products/edit/${product.id}`)}
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
              This will permanently delete the product "{productToDelete?.name}".
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
