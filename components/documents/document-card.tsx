import { Calendar, Link2 } from "lucide-react";
import Link from "next/link";

import type { DocumentWithUrl } from "@/actions/documents";
import { DocumentCategoryBadge } from "@/components/documents/document-category-badge";
import { DocumentFileTypeBadge } from "@/components/documents/document-file-type-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { ENTITY_TYPES } from "@/lib/validations/document";

export function DocumentCard({ document }: { document: DocumentWithUrl }) {
  const entityTypeLabel =
    ENTITY_TYPES.find((e) => e.value === document.entity_type)?.label ??
    document.entity_type;
  const uploaded = formatDate(document.uploaded_at.slice(0, 10));

  return (
    <Link href={`/documents/${document.id}`} className="block">
      <Card className="border-border/80 shadow-none transition-colors hover:bg-muted/30">
        <CardHeader className="space-y-2 pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <DocumentFileTypeBadge
              mimeType={document.mime_type}
              fileName={document.file_name}
            />
            <DocumentCategoryBadge category={document.category} />
          </div>
          <CardTitle className="line-clamp-2 text-base font-medium">
            {document.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Link2 className="size-4 shrink-0" />
            <span className="truncate">
              {entityTypeLabel} · {document.entityLabel}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <Calendar className="size-4 shrink-0" />
            Uploaded {uploaded}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
