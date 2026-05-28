import { Badge } from "@/components/ui/badge";

export function TenantUnitBadge({ label }: { label: string }) {
  return (
    <Badge variant="secondary" className="max-w-[10rem] truncate font-normal">
      {label}
    </Badge>
  );
}
