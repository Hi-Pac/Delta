import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../lib/firebase";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { RecentCustomers } from "@/components/dashboard/RecentCustomers";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { ReceiptCent, Users, Package2, RotateCcw, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Dashboard() {
  // For demo purposes, simulate random change percentages
  const [statChanges, setStatChanges] = useState({
    sales: { value: 0, trend: 'up' as const },
    customers: { value: 0, trend: 'up' as const },
    products: { value: 0, trend: 'neutral' as const },
    returns: { value: 0, trend: 'down' as const }
  });
  
  useEffect(() => {
    // Generate random trends for demo
    setStatChanges({
      sales: { 
        value: +(Math.random() * 10).toFixed(1), 
        trend: Math.random() > 0.3 ? 'up' : 'down'
      },
      customers: { 
        value: +(Math.random() * 8).toFixed(1), 
        trend: Math.random() > 0.4 ? 'up' : 'down'
      },
      products: { 
        value: +(Math.random() * 2).toFixed(1), 
        trend: Math.random() > 0.5 ? 'up' : 'neutral'
      },
      returns: { 
        value: +(Math.random() * 5).toFixed(1), 
        trend: Math.random() > 0.7 ? 'down' : 'up'
      }
    });
  }, []);
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard-stats'],
    queryFn: async () => {
      return getDashboardStats();
    }
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of your business performance</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/sales/create">
            <Button className="inline-flex items-center justify-center">
              <Plus className="mr-2 h-4 w-4" />
              New Sale
            </Button>
          </Link>
          <Button variant="outline" className="inline-flex items-center justify-center">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[120px] w-full" />
          </>
        ) : (
          <>
            <StatsCard 
              title="Total Sales" 
              value={`$${stats?.totalSales.toFixed(2) || '0.00'}`} 
              icon={<ReceiptCent className="h-5 w-5" />}
              change={{
                value: statChanges.sales.value,
                label: "vs last month",
                trend: statChanges.sales.trend
              }}
            />
            <StatsCard 
              title="Active Customers" 
              value={stats?.totalCustomers || 0} 
              icon={<Users className="h-5 w-5" />}
              change={{
                value: statChanges.customers.value,
                label: "vs last month",
                trend: statChanges.customers.trend
              }}
            />
            <StatsCard 
              title="Total Products" 
              value={stats?.totalProducts || 0} 
              icon={<Package2 className="h-5 w-5" />}
              change={{
                value: statChanges.products.value,
                label: "vs last month",
                trend: statChanges.products.trend
              }}
            />
            <StatsCard 
              title="Total Returns" 
              value={stats?.totalReturns || 0} 
              icon={<RotateCcw className="h-5 w-5" />}
              change={{
                value: statChanges.returns.value,
                label: "vs last month",
                trend: statChanges.returns.trend
              }}
            />
          </>
        )}
      </div>

      {/* Recent Sales Table */}
      <RecentSales />

      {/* Two Column Layout for Customer and Product Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentCustomers />
        <TopProducts />
      </div>
    </div>
  );
}
