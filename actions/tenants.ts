"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getLandlordId } from "@/lib/auth";
import { createLandlordDataClient } from "@/lib/supabase/landlord-data";
import { createClient } from "@/lib/supabase/server";
import { tenantSchema, type TenantFormValues } from "@/lib/validations/tenant";
import type { Tenant, Unit } from "@/types/database";

export type TenantActionState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof TenantFormValues, string[]>>;
};

export type TenantWithUnit = Tenant & {
  unit: Pick<Unit, "id" | "name" | "property_id"> | null;
};

export type UnitOption = {
  id: string;
  label: string;
};

function parseTenantForm(formData: FormData) {
  const raw = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    id_number: formData.get("id_number"),
    unit_id: formData.get("unit_id"),
    emergency_contact_name: formData.get("emergency_contact_name"),
    emergency_contact_phone: formData.get("emergency_contact_phone"),
    notes: formData.get("notes"),
  };

  const parsed = tenantSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const fields: TenantInsertFields = {
    first_name: data.first_name,
    last_name: data.last_name || "",
    email: data.email ?? null,
    phone: data.phone ?? null,
    id_number: data.id_number ?? null,
    unit_id: data.unit_id ?? null,
    emergency_contact_name: data.emergency_contact_name ?? null,
    emergency_contact_phone: data.emergency_contact_phone ?? null,
    notes: data.notes ?? null,
  };
  return { ok: true as const, data: fields };
}

type TenantInsertFields = {
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  id_number: string | null;
  unit_id: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
};

function buildTenantInsertPayload(landlordId: string, data: TenantInsertFields) {
  return {
    landlord_id: landlordId,
    first_name: data.first_name,
    last_name: data.last_name || "",
    email: data.email ?? null,
    phone: data.phone ?? null,
    id_number: data.id_number ?? null,
    unit_id: data.unit_id ?? null,
    emergency_contact_name: data.emergency_contact_name ?? null,
    emergency_contact_phone: data.emergency_contact_phone ?? null,
    notes: data.notes ?? null,
  };
}

async function assertUnitOwnership(unitId: string, landlordId: string) {
  const supabase = await createLandlordDataClient(landlordId);
  const { data, error } = await supabase
    .from("units")
    .select("id")
    .eq("id", unitId)
    .eq("landlord_id", landlordId)
    .single();

  return !error && !!data;
}

export async function getTenants() {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tenants")
    .select("*, unit:units(id, name, property_id)")
    .eq("landlord_id", landlordId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const { unit, ...tenant } = row as Tenant & {
      unit: Pick<Unit, "id" | "name" | "property_id"> | null;
    };
    return {
      ...tenant,
      unit: unit ?? null,
    } satisfies TenantWithUnit;
  });
}

export async function getTenant(tenantId: string) {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tenants")
    .select("*, unit:units(id, name, property_id)")
    .eq("id", tenantId)
    .eq("landlord_id", landlordId)
    .single();

  if (error || !data) {
    return null;
  }

  const { unit, ...tenant } = data as Tenant & {
    unit: Pick<Unit, "id" | "name" | "property_id"> | null;
  };
  return { ...tenant, unit: unit ?? null } satisfies TenantWithUnit;
}

export async function getUnitOptionsForTenantForm(): Promise<UnitOption[]> {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("units")
    .select("id, name, properties(name)")
    .eq("landlord_id", landlordId)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const unit = row as {
      id: string;
      name: string;
      properties: { name: string } | null;
    };
    const propertyName = unit.properties?.name ?? "Property";
    return {
      id: unit.id,
      label: `${unit.name} · ${propertyName}`,
    };
  });
}

export async function createTenant(
  _prev: TenantActionState,
  formData: FormData
): Promise<TenantActionState> {
  const parsed = parseTenantForm(formData);
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    const landlordId = await getLandlordId();

    const unitId = parsed.data.unit_id;
    if (unitId) {
      const ok = await assertUnitOwnership(unitId, landlordId);
      if (!ok) {
        return { error: "Selected unit was not found" };
      }
    }

    // DEV: cookieless anon client only — never createClient() (SSR cookies / JWT).
    const supabase = await createLandlordDataClient(landlordId);
    const payload = buildTenantInsertPayload(landlordId, parsed.data);

    console.log("createTenant landlordId", landlordId);
    console.log("createTenant payload", payload);

    const { error } = await supabase.from("tenants").insert(payload);

    if (error) {
      console.log("createTenant error", error.message);
      return { error: error.message };
    }
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }

  revalidatePath("/tenants");
  revalidatePath("/dashboard");
  revalidatePath("/properties", "layout");
  redirect("/tenants");
}

export async function updateTenant(
  tenantId: string,
  _prev: TenantActionState,
  formData: FormData
): Promise<TenantActionState> {
  const parsed = parseTenantForm(formData);
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    const landlordId = await getLandlordId();

    const unitId = parsed.data.unit_id;
    if (unitId) {
      const ok = await assertUnitOwnership(unitId, landlordId);
      if (!ok) {
        return { error: "Selected unit was not found" };
      }
    }

    const supabase = await createLandlordDataClient(landlordId);
    const { landlord_id: _omit, ...updateFields } = buildTenantInsertPayload(
      landlordId,
      parsed.data
    );
    void _omit;

    const { error } = await supabase
      .from("tenants")
      .update(updateFields)
      .eq("id", tenantId)
      .eq("landlord_id", landlordId);

    if (error) {
      return { error: error.message };
    }
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }

  revalidatePath("/tenants");
  revalidatePath(`/tenants/${tenantId}/edit`);
  revalidatePath("/dashboard");
  revalidatePath("/properties", "layout");
  redirect("/tenants");
}

export async function deleteTenant(tenantId: string) {
  try {
    const landlordId = await getLandlordId();
    const supabase = await createLandlordDataClient(landlordId);

    const { error } = await supabase
      .from("tenants")
      .delete()
      .eq("id", tenantId)
      .eq("landlord_id", landlordId);

    if (error) {
      return { error: error.message };
    }
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }

  revalidatePath("/tenants");
  revalidatePath("/dashboard");
  revalidatePath("/properties", "layout");
  return { success: true };
}

export type UnitWithTenant = Unit & {
  tenant: Pick<Tenant, "id" | "first_name" | "last_name"> | null;
};

export async function getUnitsWithTenantsByProperty(
  propertyId: string
): Promise<UnitWithTenant[]> {
  const { getUnitsByProperty } = await import("@/actions/units");
  const units = await getUnitsByProperty(propertyId);

  if (units.length === 0) {
    return [];
  }

  const landlordId = await getLandlordId();
  const supabase = await createClient();
  const unitIds = units.map((u) => u.id);

  const { data: tenants, error } = await supabase
    .from("tenants")
    .select("id, first_name, last_name, unit_id")
    .eq("landlord_id", landlordId)
    .in("unit_id", unitIds);

  if (error) {
    throw new Error(error.message);
  }

  const tenantByUnit = new Map(
    (tenants ?? []).map((t) => [t.unit_id, t])
  );

  return units.map((unit) => ({
    ...unit,
    tenant: tenantByUnit.get(unit.id) ?? null,
  }));
}
