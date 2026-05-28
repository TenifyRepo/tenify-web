"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getLandlordId } from "@/lib/auth";
import { syncInvoiceSettlement } from "@/lib/invoice-settlement";
import { tenantDisplayName } from "@/lib/tenant";
import {
  POP_ALLOWED_TYPES,
  POP_BUCKET,
  POP_MAX_BYTES,
} from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import {
  paymentSchema,
  type PaymentFormValues,
} from "@/lib/validations/payment";
import type { Invoice, Payment, Tenant, Unit } from "@/types/database";

export type PaymentActionState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof PaymentFormValues, string[]>>;
};

export type PaymentWithRelations = Payment & {
  invoice: Pick<Invoice, "id" | "invoice_number" | "balance_due" | "total_amount">;
  tenant: Pick<Tenant, "id" | "first_name" | "last_name">;
  property: { id: string; name: string };
  unit: Pick<Unit, "id" | "name">;
  popUrl: string | null;
};

export type PaymentInvoiceOption = {
  id: string;
  label: string;
  tenant_id: string;
  property_id: string;
  unit_id: string;
  balance_due: number;
  invoice_number: string;
};

const paymentSelect = `
  *,
  invoice:invoices(id, invoice_number, balance_due, total_amount),
  tenant:tenants(id, first_name, last_name),
  property:properties(id, name),
  unit:units(id, name)
`;

function parsePaymentForm(formData: FormData) {
  const raw = {
    invoice_id: formData.get("invoice_id"),
    tenant_id: formData.get("tenant_id"),
    property_id: formData.get("property_id"),
    unit_id: formData.get("unit_id"),
    payment_date: formData.get("payment_date"),
    amount_paid: formData.get("amount_paid"),
    payment_method: formData.get("payment_method") || "EFT",
    reference_number: formData.get("reference_number"),
    notes: formData.get("notes"),
    status: formData.get("status") || "pending",
  };

  const parsed = paymentSchema.safeParse(raw);
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
      invoice_id: data.invoice_id,
      tenant_id: data.tenant_id,
      property_id: data.property_id,
      unit_id: data.unit_id,
      payment_date: data.payment_date,
      amount_paid: data.amount_paid,
      payment_method: data.payment_method,
      reference_number: data.reference_number || null,
      notes: data.notes || null,
      status: data.status,
    },
  };
}

async function validateInvoiceSnapshot(
  landlordId: string,
  invoiceId: string,
  tenantId: string,
  propertyId: string,
  unitId: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("id, tenant_id, property_id, unit_id, status")
    .eq("id", invoiceId)
    .eq("landlord_id", landlordId)
    .single();

  if (error || !data) {
    return "Invoice not found";
  }
  if (data.status === "cancelled") {
    return "Cannot record payment against a cancelled invoice";
  }
  if (
    data.tenant_id !== tenantId ||
    data.property_id !== propertyId ||
    data.unit_id !== unitId
  ) {
    return "Invoice details do not match the selected invoice";
  }
  return null;
}

function validatePopFile(file: File | null) {
  if (!file || file.size === 0) {
    return { ok: true as const, file: null };
  }
  if (file.size > POP_MAX_BYTES) {
    return { ok: false as const, error: "Proof of payment must be 10 MB or less" };
  }
  if (!POP_ALLOWED_TYPES.includes(file.type as (typeof POP_ALLOWED_TYPES)[number])) {
    return {
      ok: false as const,
      error: "Upload a JPEG, PNG, WebP, GIF, or PDF file",
    };
  }
  return { ok: true as const, file };
}

function popStoragePath(
  landlordId: string,
  paymentId: string,
  fileName: string
) {
  const ext = fileName.includes(".")
    ? fileName.split(".").pop()?.toLowerCase() ?? "bin"
    : "bin";
  return `${landlordId}/${paymentId}/pop-${Date.now()}.${ext}`;
}

async function uploadPopFile(
  landlordId: string,
  paymentId: string,
  file: File
) {
  const supabase = await createClient();
  const path = popStoragePath(landlordId, paymentId, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(POP_BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

async function removePopFile(path: string | null) {
  if (!path) return;
  const supabase = await createClient();
  await supabase.storage.from(POP_BUCKET).remove([path]);
}

async function getPopSignedUrl(path: string | null) {
  if (!path) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(POP_BUCKET)
    .createSignedUrl(path, 3600);

  if (error || !data?.signedUrl) {
    return null;
  }
  return data.signedUrl;
}

function mapPaymentRow(
  row: Record<string, unknown>,
  popUrl: string | null
): PaymentWithRelations {
  const { invoice, tenant, property, unit, ...payment } = row as Payment & {
    invoice: PaymentWithRelations["invoice"];
    tenant: PaymentWithRelations["tenant"];
    property: PaymentWithRelations["property"];
    unit: PaymentWithRelations["unit"];
  };
  return { ...payment, invoice, tenant, property, unit, popUrl };
}

async function revalidatePaymentPaths(invoiceId: string, paymentId?: string) {
  revalidatePath("/payments");
  revalidatePath("/dashboard");
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  if (paymentId) {
    revalidatePath(`/payments/${paymentId}`);
    revalidatePath(`/payments/${paymentId}/edit`);
  }
}

export async function getPaymentInvoiceOptionsForForm(
  currentInvoiceId?: string
): Promise<PaymentInvoiceOption[]> {
  const options = await getPaymentInvoiceOptions();
  if (!currentInvoiceId || options.some((o) => o.id === currentInvoiceId)) {
    return options;
  }

  const landlordId = await getLandlordId();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      id,
      invoice_number,
      balance_due,
      tenant_id,
      property_id,
      unit_id,
      tenant:tenants(first_name, last_name),
      property:properties(name)
    `
    )
    .eq("id", currentInvoiceId)
    .eq("landlord_id", landlordId)
    .single();

  if (error || !data) {
    return options;
  }

  const inv = data as {
    id: string;
    invoice_number: string;
    balance_due: number;
    tenant_id: string;
    property_id: string;
    unit_id: string;
    tenant: { first_name: string; last_name: string };
    property: { name: string };
  };

  const extra: PaymentInvoiceOption = {
    id: inv.id,
    invoice_number: inv.invoice_number,
    label: `${inv.invoice_number} · ${tenantDisplayName(inv.tenant)} · ${inv.property.name}`,
    tenant_id: inv.tenant_id,
    property_id: inv.property_id,
    unit_id: inv.unit_id,
    balance_due: Number(inv.balance_due),
  };

  return [extra, ...options];
}

export async function getPaymentInvoiceOptions(): Promise<PaymentInvoiceOption[]> {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      id,
      invoice_number,
      balance_due,
      tenant_id,
      property_id,
      unit_id,
      tenant:tenants(first_name, last_name),
      property:properties(name)
    `
    )
    .eq("landlord_id", landlordId)
    .not("status", "eq", "cancelled")
    .gt("balance_due", 0)
    .order("due_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const inv = row as {
      id: string;
      invoice_number: string;
      balance_due: number;
      tenant_id: string;
      property_id: string;
      unit_id: string;
      tenant: { first_name: string; last_name: string };
      property: { name: string };
    };
    const tenantName = tenantDisplayName(inv.tenant);
    return {
      id: inv.id,
      invoice_number: inv.invoice_number,
      label: `${inv.invoice_number} · ${tenantName} · ${inv.property.name} · ${formatZarLabel(inv.balance_due)} due`,
      tenant_id: inv.tenant_id,
      property_id: inv.property_id,
      unit_id: inv.unit_id,
      balance_due: Number(inv.balance_due),
    };
  });
}

function formatZarLabel(amount: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function getPayments() {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payments")
    .select(paymentSelect)
    .eq("landlord_id", landlordId)
    .order("payment_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return Promise.all(
    (data ?? []).map(async (row) => {
      const payment = row as Payment & { pop_file_path: string | null };
      const popUrl = await getPopSignedUrl(payment.pop_file_path);
      return mapPaymentRow(row as Record<string, unknown>, popUrl);
    })
  );
}

export async function getPayment(paymentId: string) {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payments")
    .select(paymentSelect)
    .eq("id", paymentId)
    .eq("landlord_id", landlordId)
    .single();

  if (error || !data) {
    return null;
  }

  const payment = data as Payment;
  const popUrl = await getPopSignedUrl(payment.pop_file_path);
  return mapPaymentRow(data as Record<string, unknown>, popUrl);
}

export async function getRecentPayments(limit = 5) {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payments")
    .select(paymentSelect)
    .eq("landlord_id", landlordId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return Promise.all(
    (data ?? []).map(async (row) => {
      const payment = row as Payment;
      const popUrl = await getPopSignedUrl(payment.pop_file_path);
      return mapPaymentRow(row as Record<string, unknown>, popUrl);
    })
  );
}

export async function getPaymentDashboardStats() {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const [paymentsRes, invoicesRes] = await Promise.all([
    supabase
      .from("payments")
      .select("amount_paid")
      .eq("landlord_id", landlordId)
      .eq("status", "confirmed"),
    supabase
      .from("invoices")
      .select("balance_due, status")
      .eq("landlord_id", landlordId)
      .not("status", "eq", "cancelled"),
  ]);

  if (paymentsRes.error) throw new Error(paymentsRes.error.message);
  if (invoicesRes.error) throw new Error(invoicesRes.error.message);

  const totalReceived = (paymentsRes.data ?? []).reduce(
    (sum, row) => sum + Number(row.amount_paid),
    0
  );

  const outstandingBalance = (invoicesRes.data ?? []).reduce((sum, row) => {
    if (row.status === "paid") return sum;
    return sum + Number(row.balance_due);
  }, 0);

  return {
    totalPaymentsReceived: Math.round(totalReceived * 100) / 100,
    outstandingBalance: Math.round(outstandingBalance * 100) / 100,
  };
}

export async function createPayment(
  _prev: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  const parsed = parsePaymentForm(formData);
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors };
  }

  const popCheck = validatePopFile(formData.get("pop_file") as File | null);
  if (!popCheck.ok) {
    return { error: popCheck.error };
  }

  let newPaymentId: string | undefined;

  try {
    const landlordId = await getLandlordId();
    const relationError = await validateInvoiceSnapshot(
      landlordId,
      parsed.data.invoice_id,
      parsed.data.tenant_id,
      parsed.data.property_id,
      parsed.data.unit_id
    );
    if (relationError) {
      return { error: relationError };
    }

    const supabase = await createClient();
    const { data: inserted, error: insertError } = await supabase
      .from("payments")
      .insert({
        ...parsed.data,
        landlord_id: landlordId,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      return { error: insertError?.message ?? "Could not create payment" };
    }

    if (popCheck.file) {
      const popPath = await uploadPopFile(
        landlordId,
        inserted.id,
        popCheck.file
      );
      const { error: pathError } = await supabase
        .from("payments")
        .update({ pop_file_path: popPath })
        .eq("id", inserted.id)
        .eq("landlord_id", landlordId);

      if (pathError) {
        await removePopFile(popPath);
        await supabase
          .from("payments")
          .delete()
          .eq("id", inserted.id)
          .eq("landlord_id", landlordId);
        return { error: pathError.message };
      }
    }

    if (parsed.data.status === "confirmed") {
      await syncInvoiceSettlement(
        supabase,
        parsed.data.invoice_id,
        landlordId
      );
    }

    newPaymentId = inserted.id;
    await revalidatePaymentPaths(parsed.data.invoice_id, inserted.id);
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }

  redirect(`/payments/${newPaymentId}`);
}

export async function updatePayment(
  paymentId: string,
  _prev: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  const parsed = parsePaymentForm(formData);
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors };
  }

  const popCheck = validatePopFile(formData.get("pop_file") as File | null);
  if (!popCheck.ok) {
    return { error: popCheck.error };
  }

  const removePop = formData.get("remove_pop") === "true";

  try {
    const landlordId = await getLandlordId();
    const relationError = await validateInvoiceSnapshot(
      landlordId,
      parsed.data.invoice_id,
      parsed.data.tenant_id,
      parsed.data.property_id,
      parsed.data.unit_id
    );
    if (relationError) {
      return { error: relationError };
    }

    const supabase = await createClient();

    const { data: existing, error: fetchError } = await supabase
      .from("payments")
      .select("invoice_id, pop_file_path")
      .eq("id", paymentId)
      .eq("landlord_id", landlordId)
      .single();

    if (fetchError || !existing) {
      return { error: "Payment not found" };
    }

    const previousInvoiceId = existing.invoice_id;
    let popPath = existing.pop_file_path;

    if (removePop && popPath) {
      await removePopFile(popPath);
      popPath = null;
    }

    if (popCheck.file) {
      if (popPath) {
        await removePopFile(popPath);
      }
      popPath = await uploadPopFile(landlordId, paymentId, popCheck.file);
    }

    const { error: updateError } = await supabase
      .from("payments")
      .update({
        ...parsed.data,
        pop_file_path: popPath,
      })
      .eq("id", paymentId)
      .eq("landlord_id", landlordId);

    if (updateError) {
      return { error: updateError.message };
    }

    await syncInvoiceSettlement(supabase, parsed.data.invoice_id, landlordId);
    if (previousInvoiceId !== parsed.data.invoice_id) {
      await syncInvoiceSettlement(supabase, previousInvoiceId, landlordId);
    }

    await revalidatePaymentPaths(parsed.data.invoice_id, paymentId);
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }

  redirect(`/payments/${paymentId}`);
}

export async function deletePayment(paymentId: string) {
  try {
    const landlordId = await getLandlordId();
    const supabase = await createClient();

    const { data: existing, error: fetchError } = await supabase
      .from("payments")
      .select("invoice_id, pop_file_path")
      .eq("id", paymentId)
      .eq("landlord_id", landlordId)
      .single();

    if (fetchError || !existing) {
      return { error: "Payment not found" };
    }

    if (existing.pop_file_path) {
      await removePopFile(existing.pop_file_path);
    }

    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", paymentId)
      .eq("landlord_id", landlordId);

    if (error) {
      return { error: error.message };
    }

    await syncInvoiceSettlement(supabase, existing.invoice_id, landlordId);
    await revalidatePaymentPaths(existing.invoice_id);
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }

  return { success: true };
}
