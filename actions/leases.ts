"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getLandlordId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { tenantDisplayName } from "@/lib/tenant";
import { leaseSchema, type LeaseFormValues } from "@/lib/validations/lease";
import type { Lease, Tenant, Unit } from "@/types/database";

export type LeaseActionState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof LeaseFormValues, string[]>>;
};

export type LeaseWithRelations = Lease & {
  tenant: Pick<Tenant, "id" | "first_name" | "last_name">;
  property: { id: string; name: string };
  unit: Pick<Unit, "id" | "name">;
};

export type LeaseFormOptions = {
  tenants: { id: string; label: string }[];
  properties: { id: string; label: string }[];
  units: { id: string; property_id: string; label: string }[];
};

export type ActiveLeaseSummary = {
  id: string;
  status: string;
  monthly_rent: number;
  start_date: string;
  end_date: string | null;
};

export type UnitWithTenantAndLease = Unit & {
  tenant: Pick<Tenant, "id" | "first_name" | "last_name"> | null;
  activeLease: ActiveLeaseSummary | null;
};

function parseLeaseForm(formData: FormData) {
  const raw = {
    tenant_id: formData.get("tenant_id"),
    property_id: formData.get("property_id"),
    unit_id: formData.get("unit_id"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    monthly_rent: formData.get("monthly_rent"),
    deposit_amount: formData.get("deposit_amount"),
    status: formData.get("status") || "draft",
    signed_date: formData.get("signed_date"),
    notes: formData.get("notes"),
  };

  const parsed = leaseSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  return {
    ok: true as const,
    data: {
      tenant_id: data.tenant_id,
      property_id: data.property_id,
      unit_id: data.unit_id,
      start_date: data.start_date,
      end_date: data.end_date || null,
      monthly_rent: data.monthly_rent,
      deposit_amount: data.deposit_amount,
      status: data.status,
      signed_date: data.signed_date || null,
      notes: data.notes || null,
    },
  };
}

async function validateLeaseRelations(
  landlordId: string,
  propertyId: string,
  unitId: string,
  tenantId: string
) {
  const supabase = await createClient();

  const [property, unit, tenant] = await Promise.all([
    supabase
      .from("properties")
      .select("id")
      .eq("id", propertyId)
      .eq("landlord_id", landlordId)
      .single(),
    supabase
      .from("units")
      .select("id, property_id")
      .eq("id", unitId)
      .eq("landlord_id", landlordId)
      .single(),
    supabase
      .from("tenants")
      .select("id")
      .eq("id", tenantId)
      .eq("landlord_id", landlordId)
      .single(),
  ]);

  if (property.error || !property.data) {
    return "Property not found";
  }
  if (unit.error || !unit.data) {
    return "Unit not found";
  }
  if (unit.data.property_id !== propertyId) {
    return "Unit does not belong to the selected property";
  }
  if (tenant.error || !tenant.data) {
    return "Tenant not found";
  }
  return null;
}

export async function getLeaseFormOptions(): Promise<LeaseFormOptions> {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const [tenantsRes, propertiesRes, unitsRes] = await Promise.all([
    supabase
      .from("tenants")
      .select("id, first_name, last_name")
      .eq("landlord_id", landlordId)
      .order("first_name"),
    supabase
      .from("properties")
      .select("id, name")
      .eq("landlord_id", landlordId)
      .order("name"),
    supabase
      .from("units")
      .select("id, name, property_id, properties(name)")
      .eq("landlord_id", landlordId)
      .order("name"),
  ]);

  if (tenantsRes.error) throw new Error(tenantsRes.error.message);
  if (propertiesRes.error) throw new Error(propertiesRes.error.message);
  if (unitsRes.error) throw new Error(unitsRes.error.message);

  return {
    tenants: (tenantsRes.data ?? []).map((t) => ({
      id: t.id,
      label: tenantDisplayName(t),
    })),
    properties: (propertiesRes.data ?? []).map((p) => ({
      id: p.id,
      label: p.name,
    })),
    units: (unitsRes.data ?? []).map((row) => {
      const u = row as {
        id: string;
        name: string;
        property_id: string;
        properties: { name: string } | null;
      };
      return {
        id: u.id,
        property_id: u.property_id,
        label: `${u.name} · ${u.properties?.name ?? "Property"}`,
      };
    }),
  };
}

export async function getLeases() {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leases")
    .select(
      `
      *,
      tenant:tenants(id, first_name, last_name),
      property:properties(id, name),
      unit:units(id, name)
    `
    )
    .eq("landlord_id", landlordId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const { tenant, property, unit, ...lease } = row as Lease & {
      tenant: LeaseWithRelations["tenant"];
      property: LeaseWithRelations["property"];
      unit: LeaseWithRelations["unit"];
    };
    return { ...lease, tenant, property, unit } satisfies LeaseWithRelations;
  });
}

export async function getLease(leaseId: string) {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leases")
    .select(
      `
      *,
      tenant:tenants(id, first_name, last_name),
      property:properties(id, name),
      unit:units(id, name)
    `
    )
    .eq("id", leaseId)
    .eq("landlord_id", landlordId)
    .single();

  if (error || !data) {
    return null;
  }

  const { tenant, property, unit, ...lease } = data as Lease & {
    tenant: LeaseWithRelations["tenant"];
    property: LeaseWithRelations["property"];
    unit: LeaseWithRelations["unit"];
  };
  return { ...lease, tenant, property, unit } satisfies LeaseWithRelations;
}

export async function getActiveLeaseCount() {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("leases")
    .select("*", { count: "exact", head: true })
    .eq("landlord_id", landlordId)
    .eq("status", "active");

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function getDashboardCounts() {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const [properties, units, tenants, activeLeases] = await Promise.all([
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("landlord_id", landlordId),
    supabase
      .from("units")
      .select("*", { count: "exact", head: true })
      .eq("landlord_id", landlordId),
    supabase
      .from("tenants")
      .select("*", { count: "exact", head: true })
      .eq("landlord_id", landlordId),
    supabase
      .from("leases")
      .select("*", { count: "exact", head: true })
      .eq("landlord_id", landlordId)
      .eq("status", "active"),
  ]);

  if (properties.error) throw new Error(properties.error.message);
  if (units.error) throw new Error(units.error.message);
  if (tenants.error) throw new Error(tenants.error.message);
  if (activeLeases.error) throw new Error(activeLeases.error.message);

  return {
    properties: properties.count ?? 0,
    units: units.count ?? 0,
    tenants: tenants.count ?? 0,
    activeLeases: activeLeases.count ?? 0,
  };
}

export async function createLease(
  _prev: LeaseActionState,
  formData: FormData
): Promise<LeaseActionState> {
  const parsed = parseLeaseForm(formData);
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    const landlordId = await getLandlordId();
    const relationError = await validateLeaseRelations(
      landlordId,
      parsed.data.property_id,
      parsed.data.unit_id,
      parsed.data.tenant_id
    );
    if (relationError) {
      return { error: relationError };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("leases").insert({
      ...parsed.data,
      landlord_id: landlordId,
    });

    if (error) {
      return { error: error.message };
    }
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }

  revalidatePath("/leases");
  revalidatePath("/dashboard");
  revalidatePath("/properties", "layout");
  redirect("/leases");
}

export async function updateLease(
  leaseId: string,
  _prev: LeaseActionState,
  formData: FormData
): Promise<LeaseActionState> {
  const parsed = parseLeaseForm(formData);
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    const landlordId = await getLandlordId();
    const relationError = await validateLeaseRelations(
      landlordId,
      parsed.data.property_id,
      parsed.data.unit_id,
      parsed.data.tenant_id
    );
    if (relationError) {
      return { error: relationError };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("leases")
      .update(parsed.data)
      .eq("id", leaseId)
      .eq("landlord_id", landlordId);

    if (error) {
      return { error: error.message };
    }
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }

  revalidatePath("/leases");
  revalidatePath(`/leases/${leaseId}/edit`);
  revalidatePath("/dashboard");
  revalidatePath("/properties", "layout");
  redirect("/leases");
}

export async function deleteLease(leaseId: string) {
  try {
    const landlordId = await getLandlordId();
    const supabase = await createClient();

    const { error } = await supabase
      .from("leases")
      .delete()
      .eq("id", leaseId)
      .eq("landlord_id", landlordId);

    if (error) {
      return { error: error.message };
    }
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }

  revalidatePath("/leases");
  revalidatePath("/dashboard");
  revalidatePath("/properties", "layout");
  return { success: true };
}

export async function getUnitsWithTenantsAndLeasesByProperty(
  propertyId: string
): Promise<UnitWithTenantAndLease[]> {
  const { getUnitsWithTenantsByProperty } = await import("@/actions/tenants");
  const units = await getUnitsWithTenantsByProperty(propertyId);

  if (units.length === 0) {
    return [];
  }

  const landlordId = await getLandlordId();
  const supabase = await createClient();
  const unitIds = units.map((u) => u.id);

  const { data: leases, error } = await supabase
    .from("leases")
    .select("id, unit_id, status, monthly_rent, start_date, end_date")
    .eq("landlord_id", landlordId)
    .eq("property_id", propertyId)
    .eq("status", "active")
    .in("unit_id", unitIds);

  if (error) {
    throw new Error(error.message);
  }

  const leaseByUnit = new Map(
    (leases ?? []).map((l) => [l.unit_id, l as ActiveLeaseSummary])
  );

  return units.map((unit) => ({
    ...unit,
    activeLease: leaseByUnit.get(unit.id) ?? null,
  }));
}
