import { getPaymentInvoiceOptions } from "@/actions/payments";
import { PaymentForm } from "@/components/payments/payment-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Record payment",
};

export default async function NewPaymentPage() {
  let invoices: Awaited<ReturnType<typeof getPaymentInvoiceOptions>> = [];

  try {
    invoices = await getPaymentInvoiceOptions();
  } catch {
    // empty invoice select
  }

  return (
    <>
      <PageHeader
        title="Record payment"
        description="Link to an invoice, upload proof, and confirm when received."
      />
      <Card className="max-w-xl border-border/80 shadow-none">
        <CardContent className="pt-6">
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No open invoices with a balance due. Create an invoice first.
            </p>
          ) : (
            <PaymentForm mode="create" invoices={invoices} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
