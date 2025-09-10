import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type Status = "completed" | "ongoing" | "failed" | "pending" | "running"

const statusConfig: Record<Status, { className: string; label: string }> = {
  completed: {
    className: "bg-success/10 text-success border-success/20 shadow-success",
    label: "Completed"
  },
  ongoing: {
    className: "bg-warning/10 text-warning border-warning/20 shadow-warning",
    label: "Scanning"
  },
  running: {
    className: "bg-warning/10 text-warning border-warning/20 shadow-warning",
    label: "Running"
  },
  failed: {
    className: "bg-critical/10 text-critical border-critical/20 shadow-critical",
    label: "Failed"
  },
  pending: {
    className: "bg-muted/50 text-muted-foreground border-muted",
    label: "Pending"
  }
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    className: "bg-muted/50 text-muted-foreground border-muted",
    label: status || "Unknown"
  }
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}