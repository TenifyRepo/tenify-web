"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useActionState } from "react";

import {
  createLease,
  updateLease,
  type LeaseActionState,
  type LeaseFormOptions,
  type LeaseWithRelations,
} from "@/actions/leases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LEASE_STATUSES } from "@/lib/validations/lease";
import { cn } from "@/lib/utils";

const initialState: LeaseActionState = {};

type LeaseFormProps = {
  options: LeaseFormOptions;
  lease?: LeaseWithRelations;
  mode: "create" | "edit";
};

export function LeaseForm({ options, lease, mode }: LeaseFormProps) {
  const action =
    mode === "create" ? createLease : updateLease.bind(null, lease!.id);

  const [state, formAction, pending] = useActionState(action, initialState);
  const [propertyId, setPropertyId] = useState(lease?.property_id ?? "");

  const filteredUnits = useMemo(() => {
    if (!propertyId) return options.units;
    return options.units.filter((u) => u.property_id === propertyId);
  }, [options.units, propertyId]);

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <fieldset className="space-y-4" disabled={pending}>
        <div className="space-y-2">
          <Label htmlFor="tenant_id">Tenant</Label>
          <select
            id="tenant_id"
            name="tenant_id"
            defaultValue={lease?.tenant_id ?? ""}
            className={selectClass}
            aria-invalid={!!state.fieldErrors?.tenant_id}
          >
            <option value="">Select tenant</option>
            {options.tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <FieldError messages={state.fieldErrors?.tenant_id} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="property_id">Property</Label>
          <select
            id="property_id"
            name="property_id"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className={selectClass}
            aria-invalid={!!state.fieldErrors?.property_id}
          >
            <option value="">Select property</option>
            {options.properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <FieldError messages={state.fieldErrors?.property_id} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit_id">Unit</Label>
          <select
            id="unit_id"
            name="unit_id"
            key={propertyId}
            defaultValue={lease?.unit_id ?? ""}
            className={selectClass}
            disabled={!propertyId}
            aria-invalid={!!state.fieldErrors?.unit_id}
          >
            <option value="">
              {propertyId ? "Select unit" : "Choose a property first"}
            </option>
            {filteredUnits.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
          <FieldError messages={state.fieldErrors?.unit_id} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start_date">Start date</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              defaultValue={lease?.start_date ?? ""}
              aria-invalid={!!state.fieldErrors?.start_date}
            />
            <FieldError messages={state.fieldErrors?.start_date} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">
              End date{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="end_date"
              name="end_date"
              type="date"
              defaultValue={lease?.end_date ?? ""}
              aria-invalid={!!state.fieldErrors?.end_date}
            />
            <FieldError messages={state.fieldErrors?.end_date} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="monthly_rent">Monthly rent (ZAR)</Label>
            <Input
              id="monthly_rent"
              name="monthly_rent"
              type="number"
              min={0}
              step="0.01"
              defaultValue={lease?.monthly_rent ?? ""}
              aria-invalid={!!state.fieldErrors?.monthly_rent}
            />
            <FieldError messages={state.fieldErrors?.monthly_rent} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deposit_amount">Deposit (ZAR)</Label>
            <Input
              id="deposit_amount"
              name="deposit_amount"
              type="number"
              min={0}
              step="0.01"
              defaultValue={lease?.deposit_amount ?? ""}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={lease?.status ?? "draft"}
              className={selectClass}
            >
              {LEASE_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signed_date">Signed date</Label>
            <Input
              id="signed_date"
              name="signed_date"
              type="date"
              defaultValue={lease?.signed_date ?? ""}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={2}
            defaultValue={lease?.notes ?? ""}
          />
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild>
          <Link href="/leases">Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? "Add lease" : "Save changes"}
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
