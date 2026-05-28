import { Building2, Calendar, DoorOpen, Pencil } from "lucide-react";
import Link from "next/link";

import type { LeaseWithRelations } from "@/actions/leases";
import { DeleteLeaseButton } from "@/components/leases/delete-lease-button";
import { LeaseStatusBadge } from "@/components/leases/lease-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatZar } from "@/lib/format";
import { tenantDisplayName } from "@/lib/tenant";

export function LeaseCard({ lease }: { lease: LeaseWithRelations }) {
  const tenantName = tenantDisplayName(lease.tenant);
  const rent = formatZar(lease.monthly_rent);
  const start = formatDate(lease.start_date);
  const end = formatDate(lease.end_date);

  return (
    <Card className="border-border/80 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle className="truncate text-base font-medium">
            <Link
              href={`/leases/${lease.id}`}
              className="hover:underline underline-offset-4"
            >
              {tenantName}
            </Link>
          </CardTitle>
          <LeaseStatusBadge status={lease.status} />
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link
              href={`/leases/${lease.id}/edit`}
              aria-label={`Edit lease for ${tenantName}`}
            >
              <Pencil className="size-4" />
            </Link>
          </Button>
          <DeleteLeaseButton leaseId={lease.id} label={tenantName} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="size-4 shrink-0" />
          {lease.property.name}
        </p>
        <p className="flex items-center gap-2 text-muted-foreground">
          <DoorOpen className="size-4 shrink-0" />
          {lease.unit.name}
        </p>
        <p className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="size-4 shrink-0" />
          {start}
          {end ? ` → ${end}` : " → ongoing"}
        </p>
        {rent ? (
          <p className="font-medium tabular-nums text-foreground">{rent} / month</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
