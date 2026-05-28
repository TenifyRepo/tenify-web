"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useActionState } from "react";

import {
  createInvoice,
  updateInvoice,
  type InvoiceActionState,
  type InvoiceLeaseOption,
  type InvoiceWithRelations,
} from "@/actions/invoices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { INVOICE_STATUSES } from "@/lib/validations/invoice";
import { cn } from "@/lib/utils";

const initialState: InvoiceActionState = {};

type InvoiceFormProps = {
  leases: InvoiceLeaseOption[];
  invoice?: InvoiceWithRelations;
  mode: "create" | "edit";
};

export function InvoiceForm({ leases, invoice, mode }: InvoiceFormProps) {
  const action =
    mode === "create"
      ? createInvoice
      : updateInvoice.bind(null, invoice!.id);

  const [state, formAction, pending] = useActionState(action, initialState);
  const [leaseId, setLeaseId] = useState(invoice?.lease_id ?? "");
  const [tenantId, setTenantId] = useState(invoice?.tenant_id ?? "");
  const [propertyId, setPropertyId] = useState(invoice?.property_id ?? "");
  const [unitId, setUnitId] = useState(invoice?.unit_id ?? "");
  const [subtotal, setSubtotal] = useState(
    invoice?.subtotal_amount?.toString() ?? ""
  );
  const [total, setTotal] = useState(invoice?.total_amount?.toString() ?? "");

  const selectedLease = useMemo(
    () => leases.find((l) => l.id === leaseId),
    [leases, leaseId]
  );

  const readOnlySummary = selectedLease?.label ?? null;

  function handleLeaseChange(nextLeaseId: string) {
    setLeaseId(nextLeaseId);
    const lease = leases.find((l) => l.id === nextLeaseId);
    if (!lease) {
      setTenantId("");
      setPropertyId("");
      setUnitId("");
      return;
    }
    setTenantId(lease.tenant_id);
    setPropertyId(lease.property_id);
    setUnitId(lease.unit_id);
    if (mode === "create") {
      const rent = String(lease.monthly_rent);
      setSubtotal(rent);
      setTotal(rent);
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <input type="hidden" name="tenant_id" value={tenantId} />
      <input type="hidden" name="property_id" value={propertyId} />
      <input type="hidden" name="unit_id" value={unitId} />

      <fieldset className="space-y-4" disabled={pending}>
        <div className="space-y-2">
          <Label htmlFor="lease_id">Lease</Label>
          <select
            id="lease_id"
            name="lease_id"
            value={leaseId}
            onChange={(e) => handleLeaseChange(e.target.value)}
            className={selectClass}
            aria-invalid={!!state.fieldErrors?.lease_id}
          >
            <option value="">Select lease</option>
            {leases.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          <FieldError messages={state.fieldErrors?.lease_id} />
          {readOnlySummary ? (
            <p className="text-xs text-muted-foreground">{readOnlySummary}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="invoice_date">Invoice date</Label>
            <Input
              id="invoice_date"
              name="invoice_date"
              type="date"
              defaultValue={
                invoice?.invoice_date ??
                new Date().toISOString().slice(0, 10)
              }
              aria-invalid={!!state.fieldErrors?.invoice_date}
            />
            <FieldError messages={state.fieldErrors?.invoice_date} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Due date</Label>
            <Input
              id="due_date"
              name="due_date"
              type="date"
              defaultValue={invoice?.due_date ?? ""}
              aria-invalid={!!state.fieldErrors?.due_date}
            />
            <FieldError messages={state.fieldErrors?.due_date} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="billing_period_start">Billing period start</Label>
            <Input
              id="billing_period_start"
              name="billing_period_start"
              type="date"
              defaultValue={invoice?.billing_period_start ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing_period_end">Billing period end</Label>
            <Input
              id="billing_period_end"
              name="billing_period_end"
              type="date"
              defaultValue={invoice?.billing_period_end ?? ""}
            />
            <FieldError messages={state.fieldErrors?.billing_period_end} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            defaultValue={invoice?.description ?? ""}
            placeholder="e.g. Monthly rent — May 2026"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="subtotal_amount">Subtotal (ZAR)</Label>
            <Input
              id="subtotal_amount"
              name="subtotal_amount"
              type="number"
              min={0}
              step="0.01"
              value={subtotal}
              onChange={(e) => setSubtotal(e.target.value)}
              aria-invalid={!!state.fieldErrors?.subtotal_amount}
            />
            <FieldError messages={state.fieldErrors?.subtotal_amount} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total_amount">Total (ZAR)</Label>
            <Input
              id="total_amount"
              name="total_amount"
              type="number"
              min={0}
              step="0.01"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              aria-invalid={!!state.fieldErrors?.total_amount}
            />
            <FieldError messages={state.fieldErrors?.total_amount} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="amount_paid">Amount paid (ZAR)</Label>
            <Input
              id="amount_paid"
              name="amount_paid"
              type="number"
              min={0}
              step="0.01"
              defaultValue={invoice?.amount_paid ?? 0}
              aria-invalid={!!state.fieldErrors?.amount_paid}
            />
            <FieldError messages={state.fieldErrors?.amount_paid} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={invoice?.status ?? "draft"}
              className={selectClass}
            >
              {INVOICE_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={2}
            defaultValue={invoice?.notes ?? ""}
          />
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild>
          <Link href={mode === "edit" ? `/invoices/${invoice!.id}` : "/invoices"}>
            Cancel
          </Link>
        </Button>
        <Button type="submit" disabled={pending || !leaseId}>
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Create invoice"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

const selectClass = cn(
  "flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none disabled:opacity-50"
);

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-sm text-destructive">{messages[0]}</p>;
}
