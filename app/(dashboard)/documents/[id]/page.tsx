import { notFound } from "next/navigation";

import { getDocument } from "@/actions/documents";
import { DocumentDetail } from "@/components/documents/document-detail";
import { PageHeader } from "@/components/layout/page-header";

type DocumentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: DocumentDetailPageProps) {
  const { id } = await params;
  const doc = await getDocument(id);
  return { title: doc?.title ?? "Document" };
}

export default async function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const { id } = await params;
  const document = await getDocument(id);

  if (!document) {
    notFound();
  }

  return (
    <>
      <PageHeader title={document.title} description={document.file_name} />
      <DocumentDetail document={document} />
    </>
  );
}
