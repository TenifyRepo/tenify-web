import { Plus } from "lucide-react";
import Link from "next/link";

import { getPayments } from "@/actions/payments";
import { EmptyPayments } from "@/components/payments/empty-payments";
import { PaymentCard } from "@/components/payments/payment-card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Payments",
};

export default async function PaymentsPage() {
  let payments: Awaited<ReturnType<typeof getPayments>> = [];
  let loadError: string | null = null;

  try {
    payments = await getPayments();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not load payments";
  }

  return (
    <>
      <PageHeader
        title="Payments"
        description="Track rent received and proof-of-payment uploads."
      >
        <Button asChild>
          <Link href="/payments/new">
            <Plus className="size-4" />
            Record payment
          </Link>
        </Button>
      </PageHeader>

      {loadError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      ) : payments.length === 0 ? (
        <EmptyPayments />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {payments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </>
  );
}
