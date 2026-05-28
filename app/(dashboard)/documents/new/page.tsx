import { DocumentForm } from "@/components/documents/document-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import type { DocumentCategory, EntityType } from "@/lib/validations/document";
import { DOCUMENT_CATEGORIES, ENTITY_TYPES } from "@/lib/validations/document";

export const metadata = {
  title: "Upload document",
};

type NewDocumentPageProps = {
  searchParams: Promise<{
    entity_type?: string;
    entity_id?: string;
    category?: string;
  }>;
};

export default async function NewDocumentPage({
  searchParams,
}: NewDocumentPageProps) {
  const params = await searchParams;
  const entityType = ENTITY_TYPES.some((t) => t.value === params.entity_type)
    ? (params.entity_type as EntityType)
    : undefined;
  const category = DOCUMENT_CATEGORIES.includes(
    params.category as DocumentCategory
  )
    ? (params.category as DocumentCategory)
    : undefined;

  return (
    <>
      <PageHeader
        title="Upload document"
        description="Attach a file to a property, tenant, lease, invoice, or payment."
      />
      <Card className="max-w-xl border-border/80 shadow-none">
        <CardContent className="pt-6">
          <DocumentForm
            mode="create"
            defaultEntityType={entityType}
            defaultEntityId={params.entity_id}
            defaultCategory={category}
          />
        </CardContent>
      </Card>
    </>
  );
}
