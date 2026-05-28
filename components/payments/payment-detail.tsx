import { Building2, Calendar, DoorOpen, Pencil, Receipt, User } from "lucide-react";
import Link from "next/link";

import type { PaymentWithRelations } from "@/actions/payments";
import { DeletePaymentButton } from "@/components/payments/delete-payment-button";
import { PopViewerModal } from "@/components/payments/pop-viewer-modal";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatZar } from "@/lib/format";
import { tenantDisplayName } from "@/lib/tenant";

export function PaymentDetail({ payment }: { payment: PaymentWithRelations }) {
  const tenantName = tenantDisplayName(payment.tenant);
  const amount = formatZar(payment.amount_paid);

  return (
    <Card className="max-w-2xl border-border/80 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {payment.invoice.invoice_number}
          </p>
          <CardTitle className="text-xl tabular-nums">{amount}</CardTitle>
          <PaymentStatusBadge status={payment.status} />
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link
              href={`/payments/${payment.id}/edit`}
              aria-label="Edit payment"
            >
              <Pencil className="size-4" />
            </Link>
          </Button>
          <DeletePaymentButton
            paymentId={payment.id}
            label={payment.invoice.invoice_number}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <section className="space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Linked to
          </h3>
          <DetailRow icon={Receipt} label="Invoice">
            <Link
              href={`/invoices/${payment.invoice_id}`}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {payment.invoice.invoice_number}
            </Link>
          </DetailRow>
          <DetailRow icon={User} label="Tenant" value={tenantName} />
          <DetailRow
            icon={Building2}
            label="Property"
            value={payment.property.name}
          />
          <DetailRow icon={DoorOpen} label="Unit" value={payment.unit.name} />
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Payment
          </h3>
          <DetailRow
            icon={Calendar}
            label="Date"
            value={formatDate(payment.payment_date) ?? "—"}
          />
          <DetailRow icon={Receipt} label="Method" value={payment.payment_method} />
          {payment.reference_number ? (
            <DetailRow
              icon={Receipt}
              label="Reference"
              value={payment.reference_number}
            />
          ) : null}
        </section>

        {payment.popUrl ? (
          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Proof of payment
            </h3>
            <PopViewerModal url={payment.popUrl} label="View proof of payment" />
          </section>
        ) : null}

        {payment.notes ? (
          <section>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Notes
            </h3>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {payment.notes}
            </p>
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-2 text-muted-foreground">
      <Icon className="size-4 shrink-0" />
      <span>
        <span className="sr-only">{label}: </span>
        {children ?? value}
      </span>
    </p>
  );
}
