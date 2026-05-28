import { Building2, Calendar, DoorOpen, Pencil, Receipt, User } from "lucide-react";
import Link from "next/link";

import type { InvoiceWithRelations } from "@/actions/invoices";
import { DeleteInvoiceButton } from "@/components/invoices/delete-invoice-button";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatZar } from "@/lib/format";
import { tenantDisplayName } from "@/lib/tenant";

export function InvoiceDetail({ invoice }: { invoice: InvoiceWithRelations }) {
  const tenantName = tenantDisplayName(invoice.tenant);

  return (
    <Card className="max-w-2xl border-border/80 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Receipt className="size-4" />
            {invoice.invoice_number}
          </p>
          <CardTitle className="text-xl">{tenantName}</CardTitle>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link
              href={`/invoices/${invoice.id}/edit`}
              aria-label={`Edit ${invoice.invoice_number}`}
            >
              <Pencil className="size-4" />
            </Link>
          </Button>
          <DeleteInvoiceButton
            invoiceId={invoice.id}
            label={invoice.invoice_number}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <section className="space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Linked to
          </h3>
          <DetailRow icon={User} label="Tenant" value={tenantName} />
          <DetailRow icon={Building2} label="Property" value={invoice.property.name} />
          <DetailRow icon={DoorOpen} label="Unit" value={invoice.unit.name} />
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Dates
          </h3>
          <DetailRow
            icon={Calendar}
            label="Invoice date"
            value={formatDate(invoice.invoice_date) ?? "—"}
          />
          <DetailRow
            icon={Calendar}
            label="Due date"
            value={formatDate(invoice.due_date) ?? "—"}
          />
          {invoice.billing_period_start ? (
            <DetailRow
              icon={Calendar}
              label="Billing period"
              value={`${formatDate(invoice.billing_period_start)} – ${formatDate(invoice.billing_period_end)}`}
            />
          ) : null}
        </section>

        {invoice.description ? (
          <section>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Description
            </h3>
            <p>{invoice.description}</p>
          </section>
        ) : null}

        <section className="grid gap-3 rounded-lg border border-border/80 bg-muted/20 p-4 sm:grid-cols-2">
          <Amount label="Subtotal" value={invoice.subtotal_amount} />
          <Amount label="Total" value={invoice.total_amount} />
          <Amount label="Paid" value={invoice.amount_paid} />
          <Amount label="Balance due" value={invoice.balance_due} highlight />
        </section>

        {invoice.notes ? (
          <section>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Notes
            </h3>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {invoice.notes}
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
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <p className="flex items-center gap-2 text-muted-foreground">
      <Icon className="size-4 shrink-0" />
      <span className="text-foreground">
        <span className="sr-only">{label}: </span>
        {value}
      </span>
    </p>
  );
}

function Amount({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  const formatted = formatZar(value);
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={
          highlight
            ? "text-lg font-semibold tabular-nums"
            : "font-medium tabular-nums"
        }
      >
        {formatted ?? "—"}
      </p>
    </div>
  );
}
