import { Plus } from "lucide-react";
import Link from "next/link";

import { getDocuments } from "@/actions/documents";
import { DocumentCard } from "@/components/documents/document-card";
import { EmptyDocuments } from "@/components/documents/empty-documents";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Documents",
};

export default async function DocumentsPage() {
  let documents: Awaited<ReturnType<typeof getDocuments>> = [];
  let loadError: string | null = null;

  try {
    documents = await getDocuments();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not load documents";
  }

  return (
    <>
      <PageHeader
        title="Documents"
        description="Central hub for leases, IDs, inspections, and more."
      >
        <Button asChild>
          <Link href="/documents/new">
            <Plus className="size-4" />
            Upload document
          </Link>
        </Button>
      </PageHeader>

      {loadError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      ) : documents.length === 0 ? (
        <EmptyDocuments />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </>
  );
}
