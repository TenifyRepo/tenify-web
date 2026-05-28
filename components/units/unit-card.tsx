import { DoorOpen, FileText, User } from "lucide-react";

import type { UnitWithTenantAndLease } from "@/actions/leases";
import { UnitStatusBadge } from "@/components/units/unit-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatZar } from "@/lib/format";
import { tenantDisplayName } from "@/lib/tenant";

function unitSummary(unit: UnitWithTenantAndLease) {
  const parts: string[] = [];
  if (unit.bedrooms != null) parts.push(`${unit.bedrooms} bed`);
  if (unit.bathrooms != null) parts.push(`${unit.bathrooms} bath`);
  if (unit.parking_bays != null) parts.push(`${unit.parking_bays} parking`);
  return parts.join(" · ");
}

export function UnitCard({ unit }: { unit: UnitWithTenantAndLease }) {
  const rent = formatZar(unit.monthly_rent);
  const leaseRent = unit.activeLease
    ? formatZar(unit.activeLease.monthly_rent)
    : null;
  const summary = unitSummary(unit);

  return (
    <Card className="border-border/80 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <div className="min-w-0 space-y-1">
          <CardTitle className="truncate text-base font-medium">
            {unit.name}
          </CardTitle>
          {unit.type ? (
            <p className="text-xs capitalize text-muted-foreground">{unit.type}</p>
          ) : null}
        </div>
        <UnitStatusBadge status={unit.status} />
      </CardHeader>
      <CardContent className="space-y-2">
        {summary ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <DoorOpen className="size-4 shrink-0" />
            {summary}
          </p>
        ) : null}
        {unit.tenant ? (
          <p className="flex items-center gap-2 text-sm text-foreground">
            <User className="size-4 shrink-0 text-muted-foreground" />
            {tenantDisplayName(unit.tenant)}
          </p>
        ) : null}
        {unit.activeLease ? (
          <p className="flex items-center gap-2 text-sm text-foreground">
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            Active lease · {leaseRent} / month
          </p>
        ) : null}
        {rent && !unit.activeLease ? (
          <p className="text-sm font-medium tabular-nums">{rent} / month (listed)</p>
        ) : null}
        {unit.notes ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">{unit.notes}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
