import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UnitStatus } from "@/lib/validations/unit";

const statusConfig: Record<
  UnitStatus,
  { label: string; className: string }
> = {
  vacant: {
    label: "Vacant",
    className: "bg-muted text-muted-foreground",
  },
  occupied: {
    label: "Occupied",
    className: "bg-foreground/10 text-foreground",
  },
  maintenance: {
    label: "Maintenance",
    className: "bg-amber-500/15 text-amber-900 dark:text-amber-200",
  },
};

export function UnitStatusBadge({ status }: { status: string }) {
  const key = (status in statusConfig ? status : "vacant") as UnitStatus;
  const config = statusConfig[key];

  return (
    <Badge variant="secondary" className={cn("capitalize", config.className)}>
      {config.label}
    </Badge>
  );
}
