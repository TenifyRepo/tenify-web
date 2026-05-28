import { Building2, Calendar, DoorOpen, Receipt, User } from "lucide-react";
import Link from "next/link";

import type { InvoiceWithRelations } from "@/actions/invoices";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatZar } from "@/lib/format";
import { tenantDisplayName } from "@/lib/tenant";

export function InvoiceCard({ invoice }: { invoice: InvoiceWithRelations }) {
  const tenantName = tenantDisplayName(invoice.tenant);
  const due = formatDate(invoice.due_date);
  const total = formatZar(invoice.total_amount);
  const balance = formatZar(invoice.balance_due);

  return (
    <Link href={`/invoices/${invoice.id}`} className="block">
      <Card className="border-border/80 shadow-none transition-colors hover:bg-muted/30">
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              {invoice.invoice_number}
            </p>
            <CardTitle className="truncate text-base font-medium">
              {tenantName}
            </CardTitle>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <Receipt className="size-5 shrink-0 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="size-4 shrink-0" />
            {invoice.property.name}
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <DoorOpen className="size-4 shrink-0" />
            {invoice.unit.name}
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <User className="size-4 shrink-0" />
            {tenantName}
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-4 shrink-0" />
            Due {due}
          </p>
          <div className="flex flex-wrap items-baseline justify-between gap-2 pt-1">
            {total ? (
              <span className="font-medium tabular-nums text-foreground">
                {total}
              </span>
            ) : null}
            {balance && invoice.balance_due > 0 ? (
              <span className="text-xs text-muted-foreground">
                Balance {balance}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
