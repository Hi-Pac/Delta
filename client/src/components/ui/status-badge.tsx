import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant = "paid" | "pending" | "partially_paid" | "overdue" | "cancelled" | "success" | "warning" | "error" | "info";

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const statusMap: Record<StatusVariant, { bg: string; text: string; label: string }> = {
    paid: { 
      bg: "bg-green-100", 
      text: "text-green-700",
      label: "Paid"
    },
    pending: { 
      bg: "bg-yellow-100", 
      text: "text-yellow-700",
      label: "Pending"
    },
    partially_paid: { 
      bg: "bg-blue-100", 
      text: "text-blue-700",
      label: "Partially Paid"
    },
    overdue: { 
      bg: "bg-red-100", 
      text: "text-red-700",
      label: "Overdue"
    },
    cancelled: { 
      bg: "bg-gray-100", 
      text: "text-gray-700",
      label: "Cancelled"
    },
    success: { 
      bg: "bg-green-100", 
      text: "text-green-700",
      label: "Success"
    },
    warning: { 
      bg: "bg-yellow-100", 
      text: "text-yellow-700",
      label: "Warning"
    },
    error: { 
      bg: "bg-red-100", 
      text: "text-red-700",
      label: "Error"
    },
    info: { 
      bg: "bg-blue-100", 
      text: "text-blue-700",
      label: "Info"
    }
  };

  const statusStyle = statusMap[status];

  return (
    <Badge 
      variant="outline"
      className={cn(
        "font-medium border-0",
        statusStyle.bg, 
        statusStyle.text,
        className
      )}
    >
      {label || statusStyle.label}
    </Badge>
  );
}
