"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getLandlordId } from "@/lib/auth";
import { tenantDisplayName } from "@/lib/tenant";
import { createClient } from "@/lib/supabase/server";
import { invoiceSchema, type InvoiceFormValues } from "@/lib/validations/invoice";
import type { Invoice, Lease, Tenant, Unit } from "@/types/database";

export type InvoiceActionState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof InvoiceFormValues, string[]>>;
};

export type InvoiceWithRelations = Invoice & {
  lease: Pick<Lease, "id" | "monthly_rent" | "status">;
  tenant: Pick<Tenant, "id" | "first_name" | "last_name">;
  property: { id: string; name: string };
  unit: Pick<Unit, "id" | "name">;
};

export type InvoiceLeaseOption = {
  id: string;
  label: string;
  tenant_id: string;
  property_id: string;
  unit_id: string;
  monthly_rent: number;
};

function computeBalanceDue(total: number, paid: number) {
  return Math.max(0, Math.round((total - paid) * 100) / 100);
}

function parseInvoiceForm(formData: FormData) {
  const raw = {
    lease_id: formData.get("lease_id"),
    tenant_id: formData.get("tenant_id"),
    property_id: formData.get("property_id"),
    unit_id: formData.get("unit_id"),
    invoice_date: formData.get("invoice_date"),
    due_date: formData.get("due_date"),
    billing_period_start: formData.get("billing_period_start"),
    billing_period_end: formData.get("billing_period_end"),
    description: formData.get("description"),
    subtotal_amount: formData.get("subtotal_amount"),
    total_amount: formData.get("total_amount"),
    amount_paid: formData.get("amount_paid") ?? "0",
    status: formData.get("status") || "draft",
    notes: formData.get("notes"),
  };

  const parsed = invoiceSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const balance_due = computeBalanceDue(data.total_amount, data.amount_paid);

  return {
    ok: true as const,
    data: {
      lease_id: data.lease_id,
      tenant_id: data.tenant_id,
      property_id: data.property_id,
      unit_id: data.unit_id,
      invoice_date: data.invoice_date,
      due_date: data.due_date,
      billing_period_start: data.billing_period_start || null,
      billing_period_end: data.billing_period_end || null,
      description: data.description || null,
      subtotal_amount: data.subtotal_amount,
      total_amount: data.total_amount,
      amount_paid: data.amount_paid,
      balance_due,
      status: data.status,
      notes: data.notes || null,
    },
  };
}

async function validateLeaseSnapshot(
  landlordId: string,
  leaseId: string,
  tenantId: string,
  propertyId: string,
  unitId: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leases")
    .select("id, tenant_id, property_id, unit_id")
    .eq("id", leaseId)
    .eq("landlord_id", landlordId)
    .single();

  if (error || !data) {
    return "Lease not found";
  }
  if (
    data.tenant_id !== tenantId ||
    data.property_id !== propertyId ||
    data.unit_id !== unitId
  ) {
    return "Lease details do not match the selected lease";
  }
  return null;
}

async function generateInvoiceNumber(landlordId: string) {
  const supabase = await createClient();
  const year = new Date().getFullYear();

  const { count, error } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("landlord_id", landlordId)
    .gte("created_at", `${year}-01-01T00:00:00Z`)
    .lt("created_at", `${year + 1}-01-01T00:00:00Z`);

  if (error) {
    throw new Error(error.message);
  }

  const seq = String((count ?? 0) + 1).padStart(4, "0");
  return `INV-${year}-${seq}`;
}

const invoiceSelect = `
  *,
  lease:leases(id, monthly_rent, status),
  tenant:tenants(id, first_name, last_name),
  property:properties(id, name),
  unit:units(id, name)
`;

function mapInvoiceRow(row: Record<string, unknown>): InvoiceWithRelations {
  const { lease, tenant, property, unit, ...invoice } = row as Invoice & {
    lease: InvoiceWithRelations["lease"];
    tenant: InvoiceWithRelations["tenant"];
    property: InvoiceWithRelations["property"];
    unit: InvoiceWithRelations["unit"];
  };
  return { ...invoice, lease, tenant, property, unit };
}

export async function getInvoiceLeaseOptions(): Promise<InvoiceLeaseOption[]> {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leases")
    .select(
      `
      id,
      monthly_rent,
      tenant_id,
      property_id,
      unit_id,
      tenant:tenants(first_name, last_name),
      property:properties(name),
      unit:units(name)
    `
    )
    .eq("landlord_id", landlordId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const lease = row as {
      id: string;
      monthly_rent: number;
      tenant_id: string;
      property_id: string;
      unit_id: string;
      tenant: { first_name: string; last_name: string };
      property: { name: string };
      unit: { name: string };
    };
    const tenantName = tenantDisplayName(lease.tenant);
    return {
      id: lease.id,
      label: `${tenantName} · ${lease.unit.name} · ${lease.property.name}`,
      tenant_id: lease.tenant_id,
      property_id: lease.property_id,
      unit_id: lease.unit_id,
      monthly_rent: lease.monthly_rent,
    };
  });
}

export async function getInvoices() {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(invoiceSelect)
    .eq("landlord_id", landlordId)
    .order("invoice_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) =>
    mapInvoiceRow(row as Record<string, unknown>)
  );
}

export async function getInvoice(invoiceId: string) {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(invoiceSelect)
    .eq("id", invoiceId)
    .eq("landlord_id", landlordId)
    .single();

  if (error || !data) {
    return null;
  }

  return mapInvoiceRow(data as Record<string, unknown>);
}

export async function getInvoiceDashboardStats() {
  const landlordId = await getLandlordId();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("invoices")
    .select("status, balance_due, due_date")
    .eq("landlord_id", landlordId);

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const totalInvoices = rows.length;

  let unpaidInvoices = 0;
  let overdueInvoices = 0;
  let outstandingBalance = 0;

  for (const row of rows) {
    const balance = Number(row.balance_due);
    const isClosed =
      row.status === "paid" || row.status === "cancelled";

    if (!isClosed && balance > 0) {
      unpaidInvoices += 1;
      outstandingBalance += balance;
    }

    if (
      row.status === "overdue" ||
      (!isClosed && balance > 0 && row.due_date < today)
    ) {
      overdueInvoices += 1;
    }
  }

  return {
    totalInvoices,
    unpaidInvoices,
    overdueInvoices,
    outstandingBalance: Math.round(outstandingBalance * 100) / 100,
  };
}

export async function createInvoice(
  _prev: InvoiceActionState,
  formData: FormData
): Promise<InvoiceActionState> {
  const parsed = parseInvoiceForm(formData);
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    const landlordId = await getLandlordId();
    const relationError = await validateLeaseSnapshot(
      landlordId,
      parsed.data.lease_id,
      parsed.data.tenant_id,
      parsed.data.property_id,
      parsed.data.unit_id
    );
    if (relationError) {
      return { error: relationError };
    }

    const invoiceNumber = await generateInvoiceNumber(landlordId);
    const supabase = await createClient();
    const { error } = await supabase.from("invoices").insert({
      ...parsed.data,
      landlord_id: landlordId,
      invoice_number: invoiceNumber,
    });

    if (error) {
      return { error: error.message };
    }
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  redirect("/invoices");
}

export async function updateInvoice(
  invoiceId: string,
  _prev: InvoiceActionState,
  formData: FormData
): Promise<InvoiceActionState> {
  const parsed = parseInvoiceForm(formData);
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    const landlordId = await getLandlordId();
    const relationError = await validateLeaseSnapshot(
      landlordId,
      parsed.data.lease_id,
      parsed.data.tenant_id,
      parsed.data.property_id,
      parsed.data.unit_id
    );
    if (relationError) {
      return { error: relationError };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("invoices")
      .update(parsed.data)
      .eq("id", invoiceId)
      .eq("landlord_id", landlordId);

    if (error) {
      return { error: error.message };
    }
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath(`/invoices/${invoiceId}/edit`);
  revalidatePath("/dashboard");
  redirect(`/invoices/${invoiceId}`);
}

export async function deleteInvoice(invoiceId: string) {
  try {
    const landlordId = await getLandlordId();
    const supabase = await createClient();

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoiceId)
      .eq("landlord_id", landlordId);

    if (error) {
      return { error: error.message };
    }
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { success: true };
}
