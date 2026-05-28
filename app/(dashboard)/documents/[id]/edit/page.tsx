import { notFound } from "next/navigation";

import { getDocument } from "@/actions/documents";
import { DocumentForm } from "@/components/documents/document-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

type EditDocumentPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditDocumentPageProps) {
  const { id } = await params;
  const doc = await getDocument(id);
  return { title: doc ? `Edit ${doc.title}` : "Edit document" };
}

export default async function EditDocumentPage({ params }: EditDocumentPageProps) {
  const { id } = await params;
  const document = await getDocument(id);

  if (!document) {
    notFound();
  }

  return (
    <>
      <PageHeader title="Edit document" description={document.title} />
      <Card className="max-w-xl border-border/80 shadow-none">
        <CardContent className="pt-6">
          <DocumentForm mode="edit" document={document} />
        </CardContent>
      </Card>
    </>
  );
}
