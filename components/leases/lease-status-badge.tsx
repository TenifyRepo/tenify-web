import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeaseStatus } from "@/lib/validations/lease";

const statusConfig: Record<LeaseStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  active: {
    label: "Active",
    className: "bg-foreground/10 text-foreground",
  },
  expired: {
    label: "Expired",
    className: "bg-muted text-muted-foreground",
  },
  terminated: {
    label: "Terminated",
    className: "bg-destructive/10 text-destructive",
  },
};

export function LeaseStatusBadge({ status }: { status: string }) {
  const key = (status in statusConfig ? status : "draft") as LeaseStatus;
  const config = statusConfig[key];

  return (
    <Badge variant="secondary" className={cn("capitalize", config.className)}>
      {config.label}
    </Badge>
  );
}
