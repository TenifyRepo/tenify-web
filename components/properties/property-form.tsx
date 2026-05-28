"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createProperty,
  updateProperty,
  type PropertyActionState,
} from "@/actions/properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PROPERTY_TYPES } from "@/lib/validations/property";
import type { Property } from "@/types/database";
import { cn } from "@/lib/utils";

const initialState: PropertyActionState = {};

type PropertyFormProps = {
  property?: Property;
  mode: "create" | "edit";
};

export function PropertyForm({ property, mode }: PropertyFormProps) {
  const action =
    mode === "create"
      ? createProperty
      : updateProperty.bind(null, property!.id);

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
          <Label htmlFor="name">Property name</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Oak Street Flat"
            defaultValue={property?.name ?? ""}
            aria-invalid={!!state.fieldErrors?.name}
          />
          <FieldError messages={state.fieldErrors?.name} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="property_type">Type</Label>
          <select
            id="property_type"
            name="property_type"
            defaultValue={property?.property_type ?? ""}
            className={cn(
              "flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
            )}
          >
            <option value="">Select type</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address_line1">Street address</Label>
          <Input
            id="address_line1"
            name="address_line1"
            placeholder="123 Main Road"
            defaultValue={property?.address_line1 ?? ""}
            aria-invalid={!!state.fieldErrors?.address_line1}
          />
          <FieldError messages={state.fieldErrors?.address_line1} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address_line2">
            Unit / building{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="address_line2"
            name="address_line2"
            placeholder="Unit 4B"
            defaultValue={property?.address_line2 ?? ""}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              defaultValue={property?.city ?? ""}
              aria-invalid={!!state.fieldErrors?.city}
            />
            <FieldError messages={state.fieldErrors?.city} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">Province / state</Label>
            <Input
              id="state"
              name="state"
              defaultValue={property?.state ?? ""}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="postal_code">Postal code</Label>
            <Input
              id="postal_code"
              name="postal_code"
              defaultValue={property?.postal_code ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              defaultValue={property?.country ?? "ZA"}
              maxLength={2}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Gate code, parking, etc."
            defaultValue={property?.notes ?? ""}
          />
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild>
          <Link href="/properties">Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Add property"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-sm text-destructive">{messages[0]}</p>;
}
