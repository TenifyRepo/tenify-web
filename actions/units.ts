"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getLandlordId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { unitSchema, type UnitFormValues } from "@/lib/validations/unit";
import type { Property, Unit } from "@/types/database";

export type UnitActionState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof UnitFormValues, string[]>>;
};

function parseUnitForm(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    type: formData.get("type"),
    bedrooms: formData.get("bedrooms"),
    bathrooms: formData.get("bathrooms"),
    parking_bays: formData.get("parking_bays"),
    monthly_rent: formData.get("monthly_rent"),
    status: formData.get("status") || "vacant",
    notes: formData.get("notes"),
  };

  const parsed = unitSchema.safeParse(raw);
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
      name: data.name,
      type: data.type || null,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      parking_bays: data.parking_bays,
      monthly_rent: data.monthly_rent,
      status: data.status,
      notes: data.notes || null,
    },
  };
}

export async function createUnit(
  propertyId: string,
  _prev: UnitActionState,
  formData: FormData
): Promise<UnitActionState> {
  const parsed = parseUnitForm(formData);
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    const landlordId = await getLandlordId();
    const supabase = await createClient();

    const property = await supabase
      .from("properties")
      .select("id")
      .eq("id", propertyId)
      .eq("landlord_id", landlordId)
      .single();

    if (property.error || !property.data) {
      return { error: "Property not found" };
    }

    const { error } = await supabase.from("units").insert({
      ...parsed.data,
      property_id: propertyId,
      landlord_id: landlordId,
    });

    if (error) {
      return { error: error.message };
    }
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }

  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/properties");
  revalidatePath("/dashboard");
  redirect(`/properties/${propertyId}`);
}

export async function getUnitsByProperty(propertyId: string) {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("property_id", propertyId)
    .eq("landlord_id", landlordId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export type PropertyWithUnits = Property & {
  units: Unit[];
};

export async function getPropertyWithUnits(
  propertyId: string
): Promise<PropertyWithUnits | null> {
  const { getProperty } = await import("@/actions/properties");

  const property = await getProperty(propertyId);
  if (!property) {
    return null;
  }

  const units = await getUnitsByProperty(propertyId);
  return { ...property, units };
}
