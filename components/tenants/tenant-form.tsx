"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createTenant,
  updateTenant,
  type TenantActionState,
  type TenantWithUnit,
  type UnitOption,
} from "@/actions/tenants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const initialState: TenantActionState = {};

type TenantFormProps = {
  tenant?: TenantWithUnit;
  unitOptions: UnitOption[];
  mode: "create" | "edit";
};

export function TenantForm({ tenant, unitOptions, mode }: TenantFormProps) {
  const action =
    mode === "create"
      ? createTenant
      : updateTenant.bind(null, tenant!.id);

  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <fieldset className="space-y-4" disabled={pending}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">First name</Label>
            <Input
              id="first_name"
              name="first_name"
              placeholder="Thabo"
              defaultValue={tenant?.first_name ?? ""}
              aria-invalid={!!state.fieldErrors?.first_name}
              autoFocus
            />
            <FieldError messages={state.fieldErrors?.first_name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last name</Label>
            <Input
              id="last_name"
              name="last_name"
              placeholder="Mokoena"
              defaultValue={tenant?.last_name ?? ""}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="082 123 4567"
              defaultValue={tenant?.phone ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tenant@email.com"
              defaultValue={tenant?.email ?? ""}
              aria-invalid={!!state.fieldErrors?.email}
            />
            <FieldError messages={state.fieldErrors?.email} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit_id">
            Unit{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <select
            id="unit_id"
            name="unit_id"
            defaultValue={tenant?.unit_id ?? ""}
            className={selectClass}
          >
            <option value="">No unit assigned</option>
            {unitOptions.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="id_number">
            ID / passport{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="id_number"
            name="id_number"
            defaultValue={tenant?.id_number ?? ""}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">Emergency contact</Label>
            <Input
              id="emergency_contact_name"
              name="emergency_contact_name"
              placeholder="Name"
              defaultValue={tenant?.emergency_contact_name ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">Emergency phone</Label>
            <Input
              id="emergency_contact_phone"
              name="emergency_contact_phone"
              type="tel"
              defaultValue={tenant?.emergency_contact_phone ?? ""}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={2}
            placeholder="Anything useful for later"
            defaultValue={tenant?.notes ?? ""}
          />
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild>
          <Link href="/tenants">Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? "Add tenant" : "Save changes"}
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
