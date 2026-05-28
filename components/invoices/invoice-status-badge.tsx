import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/lib/validations/invoice";

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> =
  {
    draft: {
      label: "Draft",
      className: "bg-muted text-muted-foreground",
    },
    sent: {
      label: "Sent",
      className: "bg-foreground/10 text-foreground",
    },
    paid: {
      label: "Paid",
      className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    },
    overdue: {
      label: "Overdue",
      className: "bg-destructive/10 text-destructive",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-muted text-muted-foreground line-through",
    },
  };

export function InvoiceStatusBadge({ status }: { status: string }) {
  const key = (status in statusConfig ? status : "draft") as InvoiceStatus;
  const config = statusConfig[key];

  return (
    <Badge variant="secondary" className={cn("capitalize", config.className)}>
      {config.label}
    </Badge>
  );
}
