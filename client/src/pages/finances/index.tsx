import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCustomers, getCustomerBalance, getSales, getPayments, getReturns } from "../../lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Wallet, CreditCard, RotateCcw, Download } from "lucide-react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Finances() {
  const [activeTab, setActiveTab] = useState("overview");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalReturns, setTotalReturns] = useState(0);
  const [outstandingBalance, setOutstandingBalance] = useState(0);
  const [monthlySales, setMonthlySales] = useState<any[]>([]);
  const [customerBalances, setCustomerBalances] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  
  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['/api/customers'],
    queryFn: async () => getCustomers()
  });
  
  const { data: sales, isLoading: isLoadingSales } = useQuery({
    queryKey: ['/api/sales'],
    queryFn: async () => getSales()
  });
  
  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['/api/payments'],
    queryFn: async () => getPayments()
  });
  
  const { data: returns, isLoading: isLoadingReturns } = useQuery({
    queryKey: ['/api/returns'],
    queryFn: async () => getReturns()
  });
  
  const isLoading = isLoadingCustomers || isLoadingSales || isLoadingPayments || isLoadingReturns;
  
  useEffect(() => {
    const calculateFinancials = async () => {
      if (!sales || !payments || !returns || !customers) return;
      
      // Total revenue (all sales)
      const revenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      setTotalRevenue(revenue);
      
      // Total payments received
      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
      setTotalPayments(totalPaid);
      
      // Total returns
      const returnsTotal = returns.reduce((sum, ret) => sum + ret.totalAmount, 0);
      setTotalReturns(returnsTotal);
      
      // Outstanding balance
      setOutstandingBalance(revenue - totalPaid - returnsTotal);
      
      // Monthly sales data for chart
      const monthlyData = calculateMonthlySales(sales);
      setMonthlySales(monthlyData);
      
      // Payment methods data for pie chart
      const methodData = calculatePaymentMethods(payments);
      setPaymentMethodData(methodData);
      
      // Customer balances
      const balances = await calculateCustomerBalances(customers);
      setCustomerBalances(balances);
    };
    
    calculateFinancials();
  }, [sales, payments, returns, customers]);
  
  const calculateMonthlySales = (salesData: any[]) => {
    const months: Record<string, { name: string, sales: number, returns: number }> = {};
    
    // Initialize months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = format(d, "MMM yyyy");
      months[monthName] = { name: monthName, sales: 0, returns: 0 };
    }
    
    // Populate sales data
    salesData.forEach(sale => {
      const monthYear = format(sale.date, "MMM yyyy");
      if (months[monthYear]) {
        months[monthYear].sales += sale.totalAmount;
      }
    });
    
    // Populate returns data
    returns?.forEach(ret => {
      const monthYear = format(ret.date, "MMM yyyy");
      if (months[monthYear]) {
        months[monthYear].returns += ret.totalAmount;
      }
    });
    
    return Object.values(months);
  };
  
  const calculatePaymentMethods = (paymentsData: any[]) => {
    const methods: Record<string, number> = {
      cash: 0,
      credit_card: 0,
      bank_transfer: 0,
      check: 0,
    };
    
    paymentsData.forEach(payment => {
      const method = payment.paymentMethod;
      if (methods[method] !== undefined) {
        methods[method] += payment.amount;
      }
    });
    
    return [
      { name: "Cash", value: methods.cash, color: "#1976d2" },
      { name: "Credit Card", value: methods.credit_card, color: "#f50057" },
      { name: "Bank Transfer", value: methods.bank_transfer, color: "#4caf50" },
      { name: "Check", value: methods.check, color: "#ff9800" },
    ];
  };
  
  const calculateCustomerBalances = async (customersData: any[]) => {
    const balances = [];
    
    if (!customersData) return [];
    
    for (const customer of customersData) {
      const balance = await getCustomerBalance(customer.id);
      if (balance && balance.balance > 0) {
        balances.push({
          id: customer.id,
          name: customer.name,
          classification: customer.classification,
          totalSales: balance.totalSales,
          totalPayments: balance.totalPayments,
          totalReturns: balance.totalReturns,
          balance: balance.balance
        });
      }
    }
    
    return balances.sort((a, b) => b.balance - a.balance);
  };
  
  const customerBalanceColumns = [
    {
      header: "Customer",
      accessor: "name",
      className: "font-medium"
    },
    {
      header: "Type",
      accessor: (row: any) => {
        const types: Record<string, string> = {
          institution: "Institution",
          store: "Store",
          individual: "Individual"
        };
        return types[row.classification] || row.classification;
      }
    },
    {
      header: "Total Sales",
      accessor: (row: any) => `$${row.totalSales.toFixed(2)}`,
    },
    {
      header: "Total Payments",
      accessor: (row: any) => `$${row.totalPayments.toFixed(2)}`,
    },
    {
      header: "Total Returns",
      accessor: (row: any) => `$${row.totalReturns.toFixed(2)}`,
    },
    {
      header: "Outstanding Balance",
      accessor: (row: any) => `$${row.balance.toFixed(2)}`,
      className: "text-red-600 font-medium"
    },
  ];
  
  const overdueSalesColumns = [
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
      accessor: (row: any) => format(row.date, "MMM dd, yyyy"),
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
  
  const getOverdueSales = () => {
    if (!sales) return [];
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return sales.filter(sale => 
      (sale.paymentStatus === "pending" || sale.paymentStatus === "partially_paid") && 
      sale.date < thirtyDaysAgo
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-semibold text-gray-900">Financial Management</h1>
          <p className="text-sm text-gray-500">Monitor financials and track customer balances</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="inline-flex items-center justify-center">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="balances">Customer Balances</TabsTrigger>
          <TabsTrigger value="overdue">Overdue Invoices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-primary bg-opacity-10 text-primary">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    {isLoading ? (
                      <Skeleton className="h-6 w-24" />
                    ) : (
                      <h3 className="text-xl font-semibold text-gray-900">${totalRevenue.toFixed(2)}</h3>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Payments</p>
                    {isLoading ? (
                      <Skeleton className="h-6 w-24" />
                    ) : (
                      <h3 className="text-xl font-semibold text-gray-900">${totalPayments.toFixed(2)}</h3>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-red-100 text-red-600">
                    <RotateCcw className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Returns</p>
                    {isLoading ? (
                      <Skeleton className="h-6 w-24" />
                    ) : (
                      <h3 className="text-xl font-semibold text-gray-900">${totalReturns.toFixed(2)}</h3>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Outstanding Balance</p>
                    {isLoading ? (
                      <Skeleton className="h-6 w-24" />
                    ) : (
                      <h3 className="text-xl font-semibold text-gray-900">${outstandingBalance.toFixed(2)}</h3>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Revenue Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlySales} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, ""]} />
                      <Legend />
                      <Bar dataKey="sales" name="Sales" fill="#1976d2" />
                      <Bar dataKey="returns" name="Returns" fill="#f44336" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="balances">
          <Card>
            <CardHeader>
              <CardTitle>Customer Balances</CardTitle>
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
                  data={customerBalances}
                  columns={customerBalanceColumns}
                  searchField="name"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Invoices</CardTitle>
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
                  data={getOverdueSales()}
                  columns={overdueSalesColumns}
                  searchField="invoiceNumber"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
