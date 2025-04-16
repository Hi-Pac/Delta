import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
  change?: {
    value: number;
    label: string;
    trend: "up" | "down" | "neutral";
  };
}

export function StatsCard({ title, value, icon, className, change }: StatsCardProps) {
  const trendColorMap = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-yellow-600"
  };
  
  const trendIconMap = {
    up: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
        <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z" clipRule="evenodd" />
      </svg>
    ),
    down: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
        <path fillRule="evenodd" d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.768-3.769a.75.75 0 011.113.058 20.908 20.908 0 013.813 7.254l1.574-2.727a.75.75 0 011.3.75l-2.475 4.286a.75.75 0 01-1.025.275l-4.287-2.475a.75.75 0 01.75-1.3l2.71 1.565a19.422 19.422 0 00-3.013-6.024L7.53 11.533a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 010-1.06z" clipRule="evenodd" />
      </svg>
    ),
    neutral: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
        <path d="M8 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
        <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0015.5 2h-11zM6 7a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 4a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    )
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-primary bg-opacity-10 text-primary">
            {icon}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-xl font-semibold text-gray-900">{value}</h3>
          </div>
        </div>
        
        {change && (
          <div className="mt-3 flex items-center text-xs">
            <span className={cn("flex items-center", trendColorMap[change.trend])}>
              {trendIconMap[change.trend]}
              {change.value}%
            </span>
            <span className="ml-1 text-gray-500">{change.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
