import { Mail, Pencil, Phone, User } from "lucide-react";
import Link from "next/link";

import type { TenantWithUnit } from "@/actions/tenants";
import { DeleteTenantButton } from "@/components/tenants/delete-tenant-button";
import { TenantUnitBadge } from "@/components/tenants/tenant-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tenantDisplayName } from "@/lib/tenant";

export function TenantCard({ tenant }: { tenant: TenantWithUnit }) {
  const name = tenantDisplayName(tenant);

  return (
    <Card className="border-border/80 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle className="truncate text-base font-medium">{name}</CardTitle>
          {tenant.unit ? (
            <TenantUnitBadge label={tenant.unit.name} />
          ) : (
            <p className="text-xs text-muted-foreground">No unit assigned</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/tenants/${tenant.id}/edit`} aria-label={`Edit ${name}`}>
              <Pencil className="size-4" />
            </Link>
          </Button>
          <DeleteTenantButton tenantId={tenant.id} tenantName={name} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {tenant.phone ? (
          <p className="flex items-center gap-2">
            <Phone className="size-4 shrink-0" />
            {tenant.phone}
          </p>
        ) : null}
        {tenant.email ? (
          <p className="flex items-center gap-2 truncate">
            <Mail className="size-4 shrink-0" />
            {tenant.email}
          </p>
        ) : null}
        {tenant.emergency_contact_name ? (
          <p className="flex items-start gap-2">
            <User className="mt-0.5 size-4 shrink-0" />
            <span>
              {tenant.emergency_contact_name}
              {tenant.emergency_contact_phone
                ? ` · ${tenant.emergency_contact_phone}`
                : ""}
            </span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
