import { notFound } from "next/navigation";

import { getPayment } from "@/actions/payments";
import { EntityDocumentsSection } from "@/components/documents/entity-documents-section";
import { PaymentDetail } from "@/components/payments/payment-detail";
import { PageHeader } from "@/components/layout/page-header";
import { formatZar } from "@/lib/format";

type PaymentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PaymentDetailPageProps) {
  const { id } = await params;
  const payment = await getPayment(id);
  return {
    title: payment
      ? `Payment · ${formatZar(payment.amount_paid)}`
      : "Payment",
  };
}

export default async function PaymentDetailPage({
  params,
}: PaymentDetailPageProps) {
  const { id } = await params;
  const payment = await getPayment(id);

  if (!payment) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Payment"
        description={payment.invoice.invoice_number}
      />
      <PaymentDetail payment={payment} />
      <EntityDocumentsSection
        entityType="payment"
        entityId={payment.id}
        title="Related documents"
        categories={["POP", "Other"]}
        emptyMessage="No extra documents linked to this payment. Proof of payment is shown above when uploaded."
      />
    </>
  );
}
