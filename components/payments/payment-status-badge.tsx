import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/validations/payment";

const statusConfig: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-500/15 text-amber-800 dark:text-amber-400",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive",
  },
};

export function PaymentStatusBadge({ status }: { status: string }) {
  const key = (status in statusConfig ? status : "pending") as PaymentStatus;
  const config = statusConfig[key];

  return (
    <Badge variant="secondary" className={cn("capitalize", config.className)}>
      {config.label}
    </Badge>
  );
}
