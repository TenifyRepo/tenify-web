import { Calendar, Receipt, User } from "lucide-react";
import Link from "next/link";

import type { PaymentWithRelations } from "@/actions/payments";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatZar } from "@/lib/format";
import { tenantDisplayName } from "@/lib/tenant";

export function PaymentCard({ payment }: { payment: PaymentWithRelations }) {
  const tenantName = tenantDisplayName(payment.tenant);
  const amount = formatZar(payment.amount_paid);
  const date = formatDate(payment.payment_date);

  return (
    <Link href={`/payments/${payment.id}`} className="block">
      <Card className="border-border/80 shadow-none transition-colors hover:bg-muted/30">
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              {payment.invoice.invoice_number}
            </p>
            <CardTitle className="truncate text-base font-medium tabular-nums">
              {amount}
            </CardTitle>
            <PaymentStatusBadge status={payment.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <User className="size-4 shrink-0" />
            {tenantName}
          </p>
          <p className="flex items-center gap-2">
            <Receipt className="size-4 shrink-0" />
            {payment.payment_method}
            {payment.reference_number
              ? ` · ${payment.reference_number}`
              : null}
          </p>
          <p className="flex items-center gap-2">
            <Calendar className="size-4 shrink-0" />
            {date}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
