import { z } from "zod";

export const UNIT_STATUSES = [
  { value: "vacant", label: "Vacant" },
  { value: "occupied", label: "Occupied" },
  { value: "maintenance", label: "Maintenance" },
] as const;

export const UNIT_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "room", label: "Room" },
  { value: "studio", label: "Studio" },
  { value: "house", label: "House" },
  { value: "office", label: "Office" },
  { value: "other", label: "Other" },
] as const;

export type UnitStatus = (typeof UNIT_STATUSES)[number]["value"];

const optionalInt = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" || v === undefined ? null : Number(v)))
  .pipe(z.number().int().min(0).max(99).nullable());

const optionalMoney = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" || v === undefined ? null : Number(v)))
  .pipe(z.number().min(0).nullable());

export const unitSchema = z.object({
  name: z.string().min(1, "Unit name is required").max(120),
  type: z
    .enum(["apartment", "room", "studio", "house", "office", "other"])
    .optional()
    .or(z.literal("")),
  bedrooms: optionalInt,
  bathrooms: optionalInt,
  parking_bays: optionalInt,
  monthly_rent: optionalMoney,
  status: z.enum(["vacant", "occupied", "maintenance"]).default("vacant"),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export type UnitFormValues = z.infer<typeof unitSchema>;
