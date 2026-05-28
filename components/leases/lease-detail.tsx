import { Building2, Calendar, DoorOpen, Pencil, User } from "lucide-react";
import Link from "next/link";

import type { LeaseWithRelations } from "@/actions/leases";
import { LeaseStatusBadge } from "@/components/leases/lease-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatZar } from "@/lib/format";
import { tenantDisplayName } from "@/lib/tenant";

export function LeaseDetail({ lease }: { lease: LeaseWithRelations }) {
  const tenantName = tenantDisplayName(lease.tenant);
  const rent = formatZar(lease.monthly_rent);

  return (
    <Card className="max-w-2xl border-border/80 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-2">
          <CardTitle className="text-xl">{tenantName}</CardTitle>
          <LeaseStatusBadge status={lease.status} />
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/leases/${lease.id}/edit`}>
            <Pencil className="size-4" />
            Edit
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <Building2 className="size-4 shrink-0" />
          {lease.property.name}
        </p>
        <p className="flex items-center gap-2">
          <DoorOpen className="size-4 shrink-0" />
          {lease.unit.name}
        </p>
        <p className="flex items-center gap-2">
          <User className="size-4 shrink-0" />
          {tenantName}
        </p>
        <p className="flex items-center gap-2">
          <Calendar className="size-4 shrink-0" />
          {formatDate(lease.start_date)}
          {lease.end_date ? ` → ${formatDate(lease.end_date)}` : " → ongoing"}
        </p>
        {rent ? (
          <p className="font-medium tabular-nums text-foreground">{rent} / month</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
