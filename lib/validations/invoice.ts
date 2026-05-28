import { z } from "zod";

export const INVOICE_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]["value"];

const moneyRequired = z
  .string()
  .min(1, "Amount is required")
  .transform((v) => Number(v))
  .pipe(z.number().min(0));

const moneyOptional = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" || v === undefined ? 0 : Number(v)))
  .pipe(z.number().min(0));

const optionalDate = z.string().optional().or(z.literal(""));

export const invoiceSchema = z
  .object({
    lease_id: z.string().uuid("Select a lease"),
    tenant_id: z.string().uuid(),
    property_id: z.string().uuid(),
    unit_id: z.string().uuid(),
    invoice_date: z.string().min(1, "Invoice date is required"),
    due_date: z.string().min(1, "Due date is required"),
    billing_period_start: optionalDate,
    billing_period_end: optionalDate,
    description: z.string().max(500).optional().or(z.literal("")),
    subtotal_amount: moneyRequired,
    total_amount: moneyRequired,
    amount_paid: moneyOptional,
    status: z
      .enum(["draft", "sent", "paid", "overdue", "cancelled"])
      .default("draft"),
    notes: z.string().max(2000).optional().or(z.literal("")),
  })
  .refine((data) => data.due_date >= data.invoice_date, {
    message: "Due date must be on or after invoice date",
    path: ["due_date"],
  })
  .refine(
    (data) =>
      !data.billing_period_end ||
      !data.billing_period_start ||
      data.billing_period_end >= data.billing_period_start,
    {
      message: "Billing period end must be on or after start",
      path: ["billing_period_end"],
    }
  )
  .refine((data) => data.amount_paid <= data.total_amount, {
    message: "Amount paid cannot exceed total",
    path: ["amount_paid"],
  });

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
