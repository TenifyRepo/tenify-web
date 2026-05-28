export function fileTypeLabel(mimeType: string | null, fileName: string) {
  const mime = mimeType?.toLowerCase() ?? "";
  const name = fileName.toLowerCase();

  if (mime.includes("pdf") || name.endsWith(".pdf")) return "PDF";
  if (mime.startsWith("image/")) return "Image";
  if (
    mime.includes("word") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    return "Word";
  }
  return "File";
}

export function canPreviewInBrowser(mimeType: string | null, fileName: string) {
  const mime = mimeType?.toLowerCase() ?? "";
  const name = fileName.toLowerCase();
  if (mime.includes("pdf") || name.endsWith(".pdf")) return true;
  if (mime.startsWith("image/")) return true;
  return false;
}
