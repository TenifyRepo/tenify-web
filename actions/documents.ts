"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getLandlordId } from "@/lib/auth";
import {
  deleteDocumentFile,
  getSignedDocumentUrl,
  uploadDocument,
  validateDocumentFile,
} from "@/lib/documents/upload";
import { tenantDisplayName } from "@/lib/tenant";
import { createClient } from "@/lib/supabase/server";
import {
  documentMetadataSchema,
  type DocumentCategory,
  type DocumentMetadataValues,
  type EntityType,
} from "@/lib/validations/document";
import type { Document } from "@/types/database";

export type DocumentActionState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof DocumentMetadataValues, string[]>>;
};

export type DocumentWithUrl = Document & {
  fileUrl: string | null;
  entityLabel: string;
};

export type EntityDocumentOption = {
  id: string;
  label: string;
};

const ENTITY_TABLE: Record<EntityType, string> = {
  property: "properties",
  unit: "units",
  tenant: "tenants",
  lease: "leases",
  invoice: "invoices",
  payment: "payments",
};

function parseDocumentMetadata(formData: FormData) {
  const raw = {
    entity_type: formData.get("entity_type"),
    entity_id: formData.get("entity_id"),
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
  };

  const parsed = documentMetadataSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  return {
    ok: true as const,
    data: {
      entity_type: parsed.data.entity_type,
      entity_id: parsed.data.entity_id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      category: parsed.data.category,
    },
  };
}

async function validateEntityOwnership(
  landlordId: string,
  entityType: EntityType,
  entityId: string
) {
  const supabase = await createClient();
  const table = ENTITY_TABLE[entityType];

  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq("id", entityId)
    .eq("landlord_id", landlordId)
    .maybeSingle();

  if (error || !data) {
    return `${ENTITY_TABLE[entityType]} record not found`;
  }
  return null;
}

export async function resolveEntityLabel(
  landlordId: string,
  entityType: EntityType,
  entityId: string
): Promise<string> {
  const supabase = await createClient();

  switch (entityType) {
    case "property": {
      const { data } = await supabase
        .from("properties")
        .select("name")
        .eq("id", entityId)
        .eq("landlord_id", landlordId)
        .single();
      return data?.name ?? "Property";
    }
    case "unit": {
      const { data } = await supabase
        .from("units")
        .select("name, properties(name)")
        .eq("id", entityId)
        .eq("landlord_id", landlordId)
        .single();
      const row = data as { name: string; properties: { name: string } | null } | null;
      return row ? `${row.name} · ${row.properties?.name ?? "Property"}` : "Unit";
    }
    case "tenant": {
      const { data } = await supabase
        .from("tenants")
        .select("first_name, last_name")
        .eq("id", entityId)
        .eq("landlord_id", landlordId)
        .single();
      return data ? tenantDisplayName(data) : "Tenant";
    }
    case "lease": {
      const { data } = await supabase
        .from("leases")
        .select("id, tenant:tenants(first_name, last_name)")
        .eq("id", entityId)
        .eq("landlord_id", landlordId)
        .single();
      const row = data as {
        tenant: { first_name: string; last_name: string };
      } | null;
      return row ? `Lease · ${tenantDisplayName(row.tenant)}` : "Lease";
    }
    case "invoice": {
      const { data } = await supabase
        .from("invoices")
        .select("invoice_number")
        .eq("id", entityId)
        .eq("landlord_id", landlordId)
        .single();
      return data?.invoice_number ?? "Invoice";
    }
    case "payment": {
      const { data } = await supabase
        .from("payments")
        .select("amount_paid, invoice:invoices(invoice_number)")
        .eq("id", entityId)
        .eq("landlord_id", landlordId)
        .single();
      const row = data as {
        amount_paid: number;
        invoice: { invoice_number: string };
      } | null;
      return row
        ? `Payment · ${row.invoice.invoice_number}`
        : "Payment";
    }
    default:
      return "Record";
  }
}

async function attachDocumentUrls(
  rows: Document[]
): Promise<DocumentWithUrl[]> {
  const supabase = await createClient();
  const landlordId = await getLandlordId();

  return Promise.all(
    rows.map(async (doc) => {
      const [fileUrl, entityLabel] = await Promise.all([
        getSignedDocumentUrl(supabase, doc.file_path),
        resolveEntityLabel(landlordId, doc.entity_type as EntityType, doc.entity_id),
      ]);
      return { ...doc, fileUrl, entityLabel };
    })
  );
}

export async function getEntityOptions(
  entityType: EntityType
): Promise<EntityDocumentOption[]> {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  switch (entityType) {
    case "property": {
      const { data, error } = await supabase
        .from("properties")
        .select("id, name")
        .eq("landlord_id", landlordId)
        .order("name");
      if (error) throw new Error(error.message);
      return (data ?? []).map((p) => ({ id: p.id, label: p.name }));
    }
    case "unit": {
      const { data, error } = await supabase
        .from("units")
        .select("id, name, properties(name)")
        .eq("landlord_id", landlordId)
        .order("name");
      if (error) throw new Error(error.message);
      return (data ?? []).map((row) => {
        const u = row as {
          id: string;
          name: string;
          properties: { name: string } | null;
        };
        return {
          id: u.id,
          label: `${u.name} · ${u.properties?.name ?? "Property"}`,
        };
      });
    }
    case "tenant": {
      const { data, error } = await supabase
        .from("tenants")
        .select("id, first_name, last_name")
        .eq("landlord_id", landlordId)
        .order("first_name");
      if (error) throw new Error(error.message);
      return (data ?? []).map((t) => ({
        id: t.id,
        label: tenantDisplayName(t),
      }));
    }
    case "lease": {
      const { data, error } = await supabase
        .from("leases")
        .select("id, tenant:tenants(first_name, last_name), property:properties(name)")
        .eq("landlord_id", landlordId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []).map((row) => {
        const l = row as {
          id: string;
          tenant: { first_name: string; last_name: string };
          property: { name: string };
        };
        return {
          id: l.id,
          label: `${tenantDisplayName(l.tenant)} · ${l.property.name}`,
        };
      });
    }
    case "invoice": {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number")
        .eq("landlord_id", landlordId)
        .order("invoice_date", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []).map((i) => ({
        id: i.id,
        label: i.invoice_number,
      }));
    }
    case "payment": {
      const { data, error } = await supabase
        .from("payments")
        .select("id, amount_paid, invoice:invoices(invoice_number)")
        .eq("landlord_id", landlordId)
        .order("payment_date", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []).map((row) => {
        const p = row as {
          id: string;
          amount_paid: number;
          invoice: { invoice_number: string };
        };
        return {
          id: p.id,
          label: `${p.invoice.invoice_number} · R${p.amount_paid}`,
        };
      });
    }
    default:
      return [];
  }
}

export async function getDocuments() {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("landlord_id", landlordId)
    .order("uploaded_at", { ascending: false });

  if (error) throw new Error(error.message);
  return attachDocumentUrls(data ?? []);
}

export async function getDocumentsByEntity(
  entityType: EntityType,
  entityId: string,
  options?: { categories?: DocumentCategory[]; limit?: number }
) {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  let query = supabase
    .from("documents")
    .select("*")
    .eq("landlord_id", landlordId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("uploaded_at", { ascending: false });

  if (options?.categories?.length) {
    query = query.in("category", options.categories);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return attachDocumentUrls(data ?? []);
}

export async function getDocument(documentId: string) {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("landlord_id", landlordId)
    .single();

  if (error || !data) return null;
  const [doc] = await attachDocumentUrls([data]);
  return doc;
}

export async function getRecentDocuments(limit = 5) {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("landlord_id", landlordId)
    .order("uploaded_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return attachDocumentUrls(data ?? []);
}

export async function getDocumentDashboardStats() {
  const landlordId = await getLandlordId();
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("landlord_id", landlordId);

  if (error) throw new Error(error.message);
  return { totalDocuments: count ?? 0 };
}

function revalidateDocumentPaths(
  entityType: EntityType,
  entityId: string,
  documentId?: string
) {
  revalidatePath("/documents");
  revalidatePath("/dashboard");
  if (documentId) {
    revalidatePath(`/documents/${documentId}`);
    revalidatePath(`/documents/${documentId}/edit`);
  }

  const paths: Record<EntityType, string> = {
    property: `/properties/${entityId}`,
    unit: `/properties`,
    tenant: `/tenants/${entityId}/edit`,
    lease: `/leases/${entityId}`,
    invoice: `/invoices/${entityId}`,
    payment: `/payments/${entityId}`,
  };
  revalidatePath(paths[entityType]);
  revalidatePath("/properties", "layout");
}

export async function createDocument(
  _prev: DocumentActionState,
  formData: FormData
): Promise<DocumentActionState> {
  const parsed = parseDocumentMetadata(formData);
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors };
  }

  const fileCheck = validateDocumentFile(formData.get("file") as File | null);
  if (!fileCheck.ok) {
    return { error: fileCheck.error };
  }

  let newDocumentId: string | undefined;

  try {
    const landlordId = await getLandlordId();
    const entityError = await validateEntityOwnership(
      landlordId,
      parsed.data.entity_type,
      parsed.data.entity_id
    );
    if (entityError) {
      return { error: entityError };
    }

    const supabase = await createClient();
    const { data: inserted, error: insertError } = await supabase
      .from("documents")
      .insert({
        landlord_id: landlordId,
        entity_type: parsed.data.entity_type,
        entity_id: parsed.data.entity_id,
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        file_name: fileCheck.file.name,
        file_path: "pending",
        file_size: fileCheck.file.size,
        mime_type: fileCheck.file.type || null,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      return { error: insertError?.message ?? "Could not create document" };
    }

    const uploaded = await uploadDocument(
      supabase,
      landlordId,
      inserted.id,
      fileCheck.file
    );

    const { error: updateError } = await supabase
      .from("documents")
      .update({
        file_path: uploaded.path,
        file_size: uploaded.file_size,
        mime_type: uploaded.mime_type,
        file_name: fileCheck.file.name,
      })
      .eq("id", inserted.id)
      .eq("landlord_id", landlordId);

    if (updateError) {
      await deleteDocumentFile(supabase, uploaded.path);
      await supabase.from("documents").delete().eq("id", inserted.id);
      return { error: updateError.message };
    }

    newDocumentId = inserted.id;
    revalidateDocumentPaths(
      parsed.data.entity_type,
      parsed.data.entity_id,
      inserted.id
    );
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }

  redirect(`/documents/${newDocumentId}`);
}

export async function updateDocument(
  documentId: string,
  _prev: DocumentActionState,
  formData: FormData
): Promise<DocumentActionState> {
  const parsed = parseDocumentMetadata(formData);
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors };
  }

  const fileInput = formData.get("file") as File | null;
  const hasNewFile = !!fileInput && fileInput.size > 0;
  if (hasNewFile) {
    const fileCheck = validateDocumentFile(fileInput);
    if (!fileCheck.ok) {
      return { error: fileCheck.error };
    }
  }

  try {
    const landlordId = await getLandlordId();
    const entityError = await validateEntityOwnership(
      landlordId,
      parsed.data.entity_type,
      parsed.data.entity_id
    );
    if (entityError) {
      return { error: entityError };
    }

    const supabase = await createClient();
    const { data: existing, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("landlord_id", landlordId)
      .single();

    if (fetchError || !existing) {
      return { error: "Document not found" };
    }

    const previousEntityType = existing.entity_type as EntityType;
    const previousEntityId = existing.entity_id;

    let file_path = existing.file_path;
    let file_name = existing.file_name;
    let file_size = existing.file_size;
    let mime_type = existing.mime_type;

    if (hasNewFile) {
      const fileCheck = validateDocumentFile(fileInput);
      if (!fileCheck.ok) {
        return { error: fileCheck.error };
      }
      if (file_path && file_path !== "pending") {
        await deleteDocumentFile(supabase, file_path);
      }
      const uploaded = await uploadDocument(
        supabase,
        landlordId,
        documentId,
        fileCheck.file
      );
      file_path = uploaded.path;
      file_size = uploaded.file_size;
      mime_type = uploaded.mime_type;
      file_name = fileCheck.file.name;
    }

    const { error: updateError } = await supabase
      .from("documents")
      .update({
        entity_type: parsed.data.entity_type,
        entity_id: parsed.data.entity_id,
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        file_path,
        file_name,
        file_size,
        mime_type,
      })
      .eq("id", documentId)
      .eq("landlord_id", landlordId);

    if (updateError) {
      return { error: updateError.message };
    }

    revalidateDocumentPaths(parsed.data.entity_type, parsed.data.entity_id, documentId);
    if (
      previousEntityType !== parsed.data.entity_type ||
      previousEntityId !== parsed.data.entity_id
    ) {
      revalidateDocumentPaths(previousEntityType, previousEntityId);
    }
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }

  redirect(`/documents/${documentId}`);
}

export async function deleteDocument(documentId: string) {
  try {
    const landlordId = await getLandlordId();
    const supabase = await createClient();

    const { data: existing, error: fetchError } = await supabase
      .from("documents")
      .select("entity_type, entity_id, file_path")
      .eq("id", documentId)
      .eq("landlord_id", landlordId)
      .single();

    if (fetchError || !existing) {
      return { error: "Document not found" };
    }

    if (existing.file_path && existing.file_path !== "pending") {
      await deleteDocumentFile(supabase, existing.file_path);
    }

    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId)
      .eq("landlord_id", landlordId);

    if (error) {
      return { error: error.message };
    }

    revalidateDocumentPaths(
      existing.entity_type as EntityType,
      existing.entity_id
    );
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }

  return { success: true };
}
