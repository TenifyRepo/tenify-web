import { getInvoiceLeaseOptions } from "@/actions/invoices";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Create invoice",
};

export default async function NewInvoicePage() {
  let leases: Awaited<ReturnType<typeof getInvoiceLeaseOptions>> = [];

  try {
    leases = await getInvoiceLeaseOptions();
  } catch {
    // empty lease select
  }

  return (
    <>
      <PageHeader
        title="Create invoice"
        description="Bill a lease — tenant, property, and unit fill in from the lease."
      />
      <Card className="max-w-xl border-border/80 shadow-none">
        <CardContent className="pt-6">
          {leases.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add a lease first, then create an invoice from it.
            </p>
          ) : (
            <InvoiceForm mode="create" leases={leases} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
