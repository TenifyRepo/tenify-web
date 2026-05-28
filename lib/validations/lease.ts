import { z } from "zod";

export const LEASE_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "terminated", label: "Terminated" },
] as const;

export type LeaseStatus = (typeof LEASE_STATUSES)[number]["value"];

const optionalMoney = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" || v === undefined ? null : Number(v)))
  .pipe(z.number().min(0).nullable());

const optionalDate = z.string().optional().or(z.literal(""));

export const leaseSchema = z
  .object({
    tenant_id: z.string().uuid("Select a tenant"),
    property_id: z.string().uuid("Select a property"),
    unit_id: z.string().uuid("Select a unit"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: optionalDate,
    monthly_rent: z
      .string()
      .min(1, "Monthly rent is required")
      .transform((v) => Number(v))
      .pipe(z.number().min(0)),
    deposit_amount: optionalMoney,
    status: z.enum(["draft", "active", "expired", "terminated"]).default("draft"),
    signed_date: optionalDate,
    notes: z.string().max(2000).optional().or(z.literal("")),
  })
  .refine(
    (data) => !data.end_date || data.end_date >= data.start_date,
    { message: "End date must be on or after start date", path: ["end_date"] }
  );

export type LeaseFormValues = z.infer<typeof leaseSchema>;
