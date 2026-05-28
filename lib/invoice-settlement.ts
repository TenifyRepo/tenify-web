import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

type Supabase = SupabaseClient<Database>;

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

/**
 * Recalculates invoice amount_paid / balance_due from confirmed payments.
 * Sets status to paid when balance_due <= 0 (except cancelled).
 * Reverts paid → sent/overdue on partial settlement.
 */
export async function syncInvoiceSettlement(
  supabase: Supabase,
  invoiceId: string,
  landlordId: string
) {
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("total_amount, due_date, status")
    .eq("id", invoiceId)
    .eq("landlord_id", landlordId)
    .single();

  if (invoiceError || !invoice) {
    return;
  }

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("amount_paid")
    .eq("invoice_id", invoiceId)
    .eq("landlord_id", landlordId)
    .eq("status", "confirmed");

  if (paymentsError) {
    throw new Error(paymentsError.message);
  }

  const amountPaid = roundMoney(
    (payments ?? []).reduce((sum, row) => sum + Number(row.amount_paid), 0)
  );
  const total = Number(invoice.total_amount);
  const balanceDue = roundMoney(Math.max(0, total - amountPaid));
  const today = new Date().toISOString().slice(0, 10);

  let status = invoice.status;

  if (invoice.status === "cancelled") {
    await supabase
      .from("invoices")
      .update({ amount_paid: amountPaid, balance_due: balanceDue })
      .eq("id", invoiceId)
      .eq("landlord_id", landlordId);
    return;
  }

  if (balanceDue <= 0) {
    status = "paid";
  } else if (status === "paid") {
    status = invoice.due_date < today ? "overdue" : "sent";
  }

  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      amount_paid: amountPaid,
      balance_due: balanceDue,
      status,
    })
    .eq("id", invoiceId)
    .eq("landlord_id", landlordId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}
