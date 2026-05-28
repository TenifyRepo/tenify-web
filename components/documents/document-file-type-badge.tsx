import { Badge } from "@/components/ui/badge";
import { fileTypeLabel } from "@/lib/documents/file-type";

export function DocumentFileTypeBadge({
  mimeType,
  fileName,
}: {
  mimeType: string | null;
  fileName: string;
}) {
  return (
    <Badge variant="outline" className="font-mono text-xs">
      {fileTypeLabel(mimeType, fileName)}
    </Badge>
  );
}
