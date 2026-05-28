export const POP_BUCKET = "proof-of-payments";

export const POP_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const;

export const POP_MAX_BYTES = 10 * 1024 * 1024;

export const DOCUMENT_BUCKET = "tenant-documents";

export const DOCUMENT_MAX_BYTES = 15 * 1024 * 1024;

export const DOCUMENT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
