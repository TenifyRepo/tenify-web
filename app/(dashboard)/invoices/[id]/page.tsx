import { notFound } from "next/navigation";

import { getInvoice } from "@/actions/invoices";
import { EntityDocumentsSection } from "@/components/documents/entity-documents-section";
import { InvoiceDetail } from "@/components/invoices/invoice-detail";
import { PageHeader } from "@/components/layout/page-header";

type InvoiceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  return {
    title: invoice ? invoice.invoice_number : "Invoice",
  };
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  const invoice = await getInvoice(id);

  if (!invoice) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={invoice.invoice_number}
        description="Invoice details and amounts."
      />
      <InvoiceDetail invoice={invoice} />
      <EntityDocumentsSection
        entityType="invoice"
        entityId={invoice.id}
        title="Invoice documents"
        categories={["Invoice", "POP", "Other"]}
      />
    </>
  );
}
