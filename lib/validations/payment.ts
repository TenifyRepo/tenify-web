import { z } from "zod";

export const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "rejected", label: "Rejected" },
] as const;

export const PAYMENT_METHODS = [
  { value: "EFT", label: "EFT" },
  { value: "Cash", label: "Cash" },
  { value: "Card", label: "Card" },
  { value: "Other", label: "Other" },
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]["value"];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

const optionalText = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

export const paymentSchema = z.object({
  invoice_id: z.string().uuid("Select an invoice"),
  tenant_id: z.string().uuid(),
  property_id: z.string().uuid(),
  unit_id: z.string().uuid(),
  payment_date: z.string().min(1, "Payment date is required"),
  amount_paid: z
    .string()
    .min(1, "Amount is required")
    .transform((v) => Number(v))
    .pipe(z.number().positive("Amount must be greater than zero")),
  payment_method: z.enum(["EFT", "Cash", "Card", "Other"]),
  reference_number: optionalText(80),
  notes: z.string().max(2000).optional().or(z.literal("")),
  status: z.enum(["pending", "confirmed", "rejected"]).default("pending"),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
