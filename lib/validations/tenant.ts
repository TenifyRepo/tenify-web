import { z } from "zod";

const optionalText = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

export const tenantSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(80),
  last_name: z.string().max(80).optional().or(z.literal("")),
  email: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
      message: "Enter a valid email",
    }),
  phone: optionalText(30),
  id_number: optionalText(40),
  unit_id: z
    .union([z.string().uuid(), z.literal("")])
    .optional()
    .transform((value) => (value === "" || value === undefined ? null : value)),
  emergency_contact_name: optionalText(120),
  emergency_contact_phone: optionalText(30),
  notes: optionalText(2000),
});

export type TenantFormValues = z.input<typeof tenantSchema>;
export type TenantFormData = z.output<typeof tenantSchema>;
