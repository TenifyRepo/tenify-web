import { Plus } from "lucide-react";
import Link from "next/link";

import { getDocumentsByEntity } from "@/actions/documents";
import { DocumentCard } from "@/components/documents/document-card";
import { EmptyDocuments } from "@/components/documents/empty-documents";
import { Button } from "@/components/ui/button";
import type { DocumentCategory, EntityType } from "@/lib/validations/document";

type EntityDocumentsSectionProps = {
  entityType: EntityType;
  entityId: string;
  title?: string;
  categories?: DocumentCategory[];
  emptyMessage?: string;
};

export async function EntityDocumentsSection({
  entityType,
  entityId,
  title = "Documents",
  categories,
  emptyMessage,
}: EntityDocumentsSectionProps) {
  let documents: Awaited<ReturnType<typeof getDocumentsByEntity>> = [];

  try {
    documents = await getDocumentsByEntity(entityType, entityId, {
      categories,
      limit: categories ? 12 : undefined,
    });
  } catch {
    documents = [];
  }

  const uploadHref = `/documents/new?entity_type=${entityType}&entity_id=${entityId}${
    categories?.length === 1
      ? `&category=${encodeURIComponent(categories[0])}`
      : ""
  }`;

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        <Button size="sm" variant="outline" asChild>
          <Link href={uploadHref}>
            <Plus className="size-4" />
            Upload
          </Link>
        </Button>
      </div>

      {documents.length === 0 ? (
        emptyMessage ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <EmptyDocuments href={uploadHref} />
        )
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </section>
  );
}
