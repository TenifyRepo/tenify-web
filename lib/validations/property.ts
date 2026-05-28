import { z } from "zod";

export const propertySchema = z.object({
  name: z.string().min(1, "Property name is required").max(120),
  address_line1: z.string().min(1, "Street address is required").max(200),
  address_line2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().max(100).optional().or(z.literal("")),
  postal_code: z.string().max(20).optional().or(z.literal("")),
  country: z.string().max(2).default("ZA"),
  property_type: z
    .enum(["house", "apartment", "complex", "commercial", "other"])
    .optional()
    .or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;

export const PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "complex", label: "Complex / Estate" },
  { value: "commercial", label: "Commercial" },
  { value: "other", label: "Other" },
] as const;
