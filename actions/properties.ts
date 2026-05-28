"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getLandlordId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  propertySchema,
  type PropertyFormValues,
} from "@/lib/validations/property";
import type { Property } from "@/types/database";

export type PropertyActionState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof PropertyFormValues, string[]>>;
};

function parsePropertyForm(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    address_line1: formData.get("address_line1"),
    address_line2: formData.get("address_line2"),
    city: formData.get("city"),
    state: formData.get("state"),
    postal_code: formData.get("postal_code"),
    country: formData.get("country") || "ZA",
    property_type: formData.get("property_type"),
    notes: formData.get("notes"),
  };

  const parsed = propertySchema.safeParse(raw);
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
      address_line1: data.address_line1,
      address_line2: data.address_line2 || null,
      city: data.city,
      state: data.state || null,
      postal_code: data.postal_code || null,
      country: data.country,
      property_type: data.property_type || null,
      notes: data.notes || null,
    },
  };
}

export async function createProperty(
  _prev: PropertyActionState,
  formData: FormData
): Promise<PropertyActionState> {
  const parsed = parsePropertyForm(formData);
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    const landlordId = await getLandlordId();
    const supabase = await createClient();

    const { error } = await supabase.from("properties").insert({
      ...parsed.data,
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

  revalidatePath("/properties");
  revalidatePath("/dashboard");
  redirect("/properties");
}

export async function updateProperty(
  propertyId: string,
  _prev: PropertyActionState,
  formData: FormData
): Promise<PropertyActionState> {
  const parsed = parsePropertyForm(formData);
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    const landlordId = await getLandlordId();
    const supabase = await createClient();

    const { error } = await supabase
      .from("properties")
      .update(parsed.data)
      .eq("id", propertyId)
      .eq("landlord_id", landlordId);

    if (error) {
      return { error: error.message };
    }
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }

  revalidatePath("/properties");
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath(`/properties/${propertyId}/edit`);
  revalidatePath("/dashboard");
  redirect("/properties");
}

export async function deleteProperty(propertyId: string) {
  try {
    const landlordId = await getLandlordId();
    const supabase = await createClient();

    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", propertyId)
      .eq("landlord_id", landlordId);

    if (error) {
      return { error: error.message };
    }
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }

  revalidatePath("/properties");
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export type PropertyWithUnitCount = Property & { unit_count: number };

export async function getProperties() {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select("*, units(count)")
    .eq("landlord_id", landlordId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((row) => {
    const record = row as Property & { units: { count: number }[] };
    const unitCount = record.units?.[0]?.count ?? 0;
    const { units, ...property } = record;
    void units;
    return {
      ...property,
      unit_count: unitCount,
    };
  });
}

export async function getProperty(propertyId: string) {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .eq("landlord_id", landlordId)
    .single();

  if (error) {
    return null;
  }

  return data;
}
