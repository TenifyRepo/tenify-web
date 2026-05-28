"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useActionState } from "react";

import {
  createPayment,
  updatePayment,
  type PaymentActionState,
  type PaymentInvoiceOption,
  type PaymentWithRelations,
} from "@/actions/payments";
import { PopUploadField } from "@/components/payments/pop-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
} from "@/lib/validations/payment";
import { cn } from "@/lib/utils";

const initialState: PaymentActionState = {};

type PaymentFormProps = {
  invoices: PaymentInvoiceOption[];
  payment?: PaymentWithRelations;
  mode: "create" | "edit";
};

export function PaymentForm({ invoices, payment, mode }: PaymentFormProps) {
  const action =
    mode === "create"
      ? createPayment
      : updatePayment.bind(null, payment!.id);

  const [state, formAction, pending] = useActionState(action, initialState);
  const [invoiceId, setInvoiceId] = useState(payment?.invoice_id ?? "");
  const [tenantId, setTenantId] = useState(payment?.tenant_id ?? "");
  const [propertyId, setPropertyId] = useState(payment?.property_id ?? "");
  const [unitId, setUnitId] = useState(payment?.unit_id ?? "");
  const [amount, setAmount] = useState(
    payment?.amount_paid?.toString() ?? ""
  );

  const selectedInvoice = useMemo(
    () => invoices.find((inv) => inv.id === invoiceId),
    [invoices, invoiceId]
  );

  function handleInvoiceChange(nextId: string) {
    setInvoiceId(nextId);
    const inv = invoices.find((i) => i.id === nextId);
    if (!inv) {
      setTenantId("");
      setPropertyId("");
      setUnitId("");
      return;
    }
    setTenantId(inv.tenant_id);
    setPropertyId(inv.property_id);
    setUnitId(inv.unit_id);
    if (mode === "create") {
      setAmount(String(inv.balance_due));
    }
  }

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="space-y-6"
    >
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
          <Label htmlFor="invoice_id">Invoice</Label>
          <select
            id="invoice_id"
            name="invoice_id"
            value={invoiceId}
            onChange={(e) => handleInvoiceChange(e.target.value)}
            className={selectClass}
            aria-invalid={!!state.fieldErrors?.invoice_id}
          >
            <option value="">Select invoice</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.label}
              </option>
            ))}
          </select>
          <FieldError messages={state.fieldErrors?.invoice_id} />
          {selectedInvoice ? (
            <p className="text-xs text-muted-foreground">
              Balance due: R {selectedInvoice.balance_due.toLocaleString("en-ZA")}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="payment_date">Payment date</Label>
            <Input
              id="payment_date"
              name="payment_date"
              type="date"
              defaultValue={
                payment?.payment_date ??
                new Date().toISOString().slice(0, 10)
              }
              aria-invalid={!!state.fieldErrors?.payment_date}
            />
            <FieldError messages={state.fieldErrors?.payment_date} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount_paid">Amount (ZAR)</Label>
            <Input
              id="amount_paid"
              name="amount_paid"
              type="number"
              min={0.01}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-invalid={!!state.fieldErrors?.amount_paid}
            />
            <FieldError messages={state.fieldErrors?.amount_paid} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment method</Label>
            <select
              id="payment_method"
              name="payment_method"
              defaultValue={payment?.payment_method ?? "EFT"}
              className={selectClass}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={payment?.status ?? "pending"}
              className={selectClass}
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reference_number">
            Reference{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="reference_number"
            name="reference_number"
            defaultValue={payment?.reference_number ?? ""}
            placeholder="Bank reference"
          />
        </div>

        <PopUploadField
          existingFile={!!payment?.pop_file_path}
          existingUrl={payment?.popUrl}
        />

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={2}
            defaultValue={payment?.notes ?? ""}
          />
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild>
          <Link
            href={
              mode === "edit" ? `/payments/${payment!.id}` : "/payments"
            }
          >
            Cancel
          </Link>
        </Button>
        <Button type="submit" disabled={pending || !invoiceId}>
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Record payment"
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
