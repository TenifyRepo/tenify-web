"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createUnit, type UnitActionState } from "@/actions/units";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UNIT_STATUSES, UNIT_TYPES } from "@/lib/validations/unit";
import { cn } from "@/lib/utils";

const initialState: UnitActionState = {};

type UnitFormProps = {
  propertyId: string;
};

export function UnitForm({ propertyId }: UnitFormProps) {
  const action = createUnit.bind(null, propertyId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <fieldset className="space-y-4" disabled={pending}>
        <div className="space-y-2">
          <Label htmlFor="name">Unit name</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Unit 1, Flat A"
            aria-invalid={!!state.fieldErrors?.name}
            autoFocus
          />
          <FieldError messages={state.fieldErrors?.name} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              name="type"
              defaultValue=""
              className={selectClass}
            >
              <option value="">Select type</option>
              {UNIT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue="vacant"
              className={selectClass}
            >
              {UNIT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="bedrooms">Beds</Label>
            <Input
              id="bedrooms"
              name="bedrooms"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bathrooms">Baths</Label>
            <Input
              id="bathrooms"
              name="bathrooms"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parking_bays">Parking</Label>
            <Input
              id="parking_bays"
              name="parking_bays"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthly_rent">Monthly rent (ZAR)</Label>
          <Input
            id="monthly_rent"
            name="monthly_rent"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            placeholder="8500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={2}
            placeholder="Keys, meter numbers, etc."
          />
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild>
          <Link href={`/properties/${propertyId}`}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add unit"}
        </Button>
      </div>
    </form>
  );
}

const selectClass = cn(
  "flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
);

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-sm text-destructive">{messages[0]}</p>;
}
