import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Invoices",
};

export default function InvoicesPage() {
  return (
    <>
      <PageHeader
        title="Invoices"
        description="Generate invoices and track payments."
      >
        <Badge variant="secondary">Coming soon</Badge>
      </PageHeader>
      <p className="text-sm text-muted-foreground">
        Invoices, payment tracking, and proof-of-payment uploads will ship in a
        later release.
      </p>
    </>
  );
}
