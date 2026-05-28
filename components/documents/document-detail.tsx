import { Calendar, Link2, Pencil } from "lucide-react";
import Link from "next/link";

import type { DocumentWithUrl } from "@/actions/documents";
import { DeleteDocumentButton } from "@/components/documents/delete-document-button";
import { DocumentCategoryBadge } from "@/components/documents/document-category-badge";
import { DocumentFileTypeBadge } from "@/components/documents/document-file-type-badge";
import { DocumentViewerModal } from "@/components/documents/document-viewer-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { ENTITY_TYPES } from "@/lib/validations/document";

export function DocumentDetail({ document }: { document: DocumentWithUrl }) {
  const entityTypeLabel =
    ENTITY_TYPES.find((e) => e.value === document.entity_type)?.label ??
    document.entity_type;
  const uploaded = formatDate(document.uploaded_at.slice(0, 10));

  return (
    <Card className="max-w-2xl border-border/80 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <DocumentFileTypeBadge
              mimeType={document.mime_type}
              fileName={document.file_name}
            />
            <DocumentCategoryBadge category={document.category} />
          </div>
          <CardTitle className="text-xl">{document.title}</CardTitle>
        </div>
        <div className="flex shrink-0 gap-0.5">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/documents/${document.id}/edit`} aria-label="Edit">
              <Pencil className="size-4" />
            </Link>
          </Button>
          <DeleteDocumentButton documentId={document.id} title={document.title} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <p className="flex items-center gap-2 text-muted-foreground">
          <Link2 className="size-4 shrink-0" />
          {entityTypeLabel} · {document.entityLabel}
        </p>
        <p className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="size-4 shrink-0" />
          Uploaded {uploaded}
        </p>
        {document.description ? (
          <p className="whitespace-pre-wrap text-muted-foreground">
            {document.description}
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground">{document.file_name}</p>
        {document.fileUrl ? (
          <DocumentViewerModal
            url={document.fileUrl}
            fileName={document.file_name}
            mimeType={document.mime_type}
            label="View / download"
            size="default"
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
