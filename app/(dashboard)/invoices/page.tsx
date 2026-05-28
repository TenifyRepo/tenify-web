import { Plus } from "lucide-react";
import Link from "next/link";

import { getInvoices } from "@/actions/invoices";
import { EmptyInvoices } from "@/components/invoices/empty-invoices";
import { InvoiceCard } from "@/components/invoices/invoice-card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Invoices",
};

export default async function InvoicesPage() {
  let invoices: Awaited<ReturnType<typeof getInvoices>> = [];
  let loadError: string | null = null;

  try {
    invoices = await getInvoices();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not load invoices";
  }

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Track rent invoices and balances."
      >
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="size-4" />
            Create invoice
          </Link>
        </Button>
      </PageHeader>

      {loadError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      ) : invoices.length === 0 ? (
        <EmptyInvoices />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {invoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}
    </>
  );
}
