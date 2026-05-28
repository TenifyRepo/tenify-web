import type { SupabaseClient } from "@supabase/supabase-js";

import {
  DOCUMENT_ALLOWED_TYPES,
  DOCUMENT_BUCKET,
  DOCUMENT_MAX_BYTES,
} from "@/lib/storage";
import type { Database } from "@/types/database";

type Supabase = SupabaseClient<Database>;

export function validateDocumentFile(file: File | null) {
  if (!file || file.size === 0) {
    return { ok: false as const, error: "A file is required" };
  }
  if (file.size > DOCUMENT_MAX_BYTES) {
    return { ok: false as const, error: "File must be 15 MB or less" };
  }
  if (
    !DOCUMENT_ALLOWED_TYPES.includes(
      file.type as (typeof DOCUMENT_ALLOWED_TYPES)[number]
    )
  ) {
    return {
      ok: false as const,
      error: "Upload a PDF, image (JPEG/PNG/WebP/GIF), or Word document",
    };
  }
  return { ok: true as const, file };
}

export function documentStoragePath(
  landlordId: string,
  documentId: string,
  fileName: string
) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${landlordId}/${documentId}/${Date.now()}-${safeName}`;
}

export async function uploadDocument(
  supabase: Supabase,
  landlordId: string,
  documentId: string,
  file: File
) {
  const path = documentStoragePath(landlordId, documentId, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return {
    path,
    file_size: file.size,
    mime_type: file.type || null,
  };
}

export async function deleteDocumentFile(supabase: Supabase, path: string | null) {
  if (!path) return;
  await supabase.storage.from(DOCUMENT_BUCKET).remove([path]);
}

/** Removes the file from storage (alias for storage cleanup). */
export const deleteDocument = deleteDocumentFile;

export async function getSignedDocumentUrl(
  supabase: Supabase,
  path: string | null,
  expiresIn = 3600
) {
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}
