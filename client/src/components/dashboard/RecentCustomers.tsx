import { useQuery } from "@tanstack/react-query";
import { getRecentCustomers } from "../../lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "wouter";

export function RecentCustomers() {
  const { data: customers, isLoading } = useQuery({
    queryKey: ['/api/recent-customers'],
    queryFn: async () => {
      return getRecentCustomers(5);
    }
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getClassificationLabel = (classification: string) => {
    switch (classification) {
      case 'institution': return 'Institution';
      case 'store': return 'Store';
      case 'individual': return 'Individual';
      default: return classification;
    }
  };
  
  const getAvatarColor = (classification: string) => {
    switch (classification) {
      case 'institution': return 'bg-primary-light text-primary';
      case 'store': return 'bg-pink-100 text-pink-600';
      case 'individual': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Recent Customers</CardTitle>
        <Link href="/customers">
          <Button variant="ghost" className="text-sm text-primary">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {customers?.map((customer) => (
              <li key={customer.id} className="py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Avatar className={`h-10 w-10 ${getAvatarColor(customer.classification)}`}>
                    <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                    <p className="text-xs text-gray-500">
                      {getClassificationLabel(customer.classification)} • Added {format(customer.createdAt, "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="text-gray-500">
                  <Link href={`/customers/edit/${customer.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
