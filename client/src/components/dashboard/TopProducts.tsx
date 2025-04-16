import { useQuery } from "@tanstack/react-query";
import { getTopProducts } from "../../lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package2, Wallpaper, PaintBucket, Palette, ConstructionIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export function TopProducts() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/top-products'],
    queryFn: async () => {
      return getTopProducts(5);
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'construction':
        return <ConstructionIcon className="h-5 w-5" />;
      case 'external_facades':
        return <Wallpaper className="h-5 w-5" />;
      case 'decorative':
        return <Palette className="h-5 w-5" />;
      default:
        return <Package2 className="h-5 w-5" />;
    }
  };
  
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'construction': return 'Construction';
      case 'external_facades': return 'External Facades';
      case 'decorative': return 'Decorative';
      default: return category;
    }
  };
  
  const getStockStatus = (stock: number) => {
    if (stock > 100) return { label: 'In stock', className: 'text-green-600' };
    if (stock > 10) return { label: 'In stock', className: 'text-green-600' };
    if (stock > 0) return { label: 'Low stock', className: 'text-yellow-600' };
    return { label: 'Out of stock', className: 'text-red-600' };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Top Products</CardTitle>
        <Link href="/products">
          <Button variant="ghost" className="text-sm text-primary">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="ml-auto">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {products?.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              
              return (
                <li key={product.id} className="py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                      {getCategoryIcon(product.category)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        {getCategoryLabel(product.category)} • ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{product.stock} units</p>
                    <p className={`text-xs ${stockStatus.className}`}>{stockStatus.label}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
