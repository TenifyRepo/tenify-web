import { notFound } from "next/navigation";

import { getPayment, getPaymentInvoiceOptionsForForm } from "@/actions/payments";
import { PaymentForm } from "@/components/payments/payment-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { formatZar } from "@/lib/format";

type EditPaymentPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditPaymentPageProps) {
  const { id } = await params;
  const payment = await getPayment(id);
  return {
    title: payment
      ? `Edit payment · ${formatZar(payment.amount_paid)}`
      : "Edit payment",
  };
}

export default async function EditPaymentPage({ params }: EditPaymentPageProps) {
  const { id } = await params;
  const payment = await getPayment(id);

  if (!payment) {
    notFound();
  }

  let invoices: Awaited<ReturnType<typeof getPaymentInvoiceOptionsForForm>> =
    [];

  try {
    invoices = await getPaymentInvoiceOptionsForForm(payment.invoice_id);
  } catch {
    // empty invoice select
  }

  return (
    <>
      <PageHeader
        title="Edit payment"
        description={payment.invoice.invoice_number}
      />
      <Card className="max-w-xl border-border/80 shadow-none">
        <CardContent className="pt-6">
          <PaymentForm mode="edit" payment={payment} invoices={invoices} />
        </CardContent>
      </Card>
    </>
  );
}
