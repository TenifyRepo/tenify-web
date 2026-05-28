import { z } from "zod";

export const ENTITY_TYPES = [
  { value: "property", label: "Property" },
  { value: "unit", label: "Unit" },
  { value: "tenant", label: "Tenant" },
  { value: "lease", label: "Lease" },
  { value: "invoice", label: "Invoice" },
  { value: "payment", label: "Payment" },
] as const;

export const DOCUMENT_CATEGORIES = [
  "Lease Agreement",
  "POP",
  "ID Document",
  "Rates & Taxes",
  "Inspection",
  "Invoice",
  "Other",
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number]["value"];
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

const categoryEnum = z.enum([
  "Lease Agreement",
  "POP",
  "ID Document",
  "Rates & Taxes",
  "Inspection",
  "Invoice",
  "Other",
]);

export const documentMetadataSchema = z.object({
  entity_type: z.enum([
    "property",
    "unit",
    "tenant",
    "lease",
    "invoice",
    "payment",
  ]),
  entity_id: z.string().uuid("Select a linked record"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  category: categoryEnum,
});

export type DocumentMetadataValues = z.infer<typeof documentMetadataSchema>;
