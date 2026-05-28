import { notFound } from "next/navigation";

import { getInvoice, getInvoiceLeaseOptions } from "@/actions/invoices";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

type EditInvoicePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditInvoicePageProps) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  return {
    title: invoice ? `Edit ${invoice.invoice_number}` : "Edit invoice",
  };
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = await params;
  const invoice = await getInvoice(id);

  if (!invoice) {
    notFound();
  }

  let leases: Awaited<ReturnType<typeof getInvoiceLeaseOptions>> = [];

  try {
    leases = await getInvoiceLeaseOptions();
  } catch {
    // empty lease select
  }

  return (
    <>
      <PageHeader
        title="Edit invoice"
        description={invoice.invoice_number}
      />
      <Card className="max-w-xl border-border/80 shadow-none">
        <CardContent className="pt-6">
          <InvoiceForm mode="edit" invoice={invoice} leases={leases} />
        </CardContent>
      </Card>
    </>
  );
}
