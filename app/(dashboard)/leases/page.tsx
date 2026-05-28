import { PageHeader } from "@/components/layout/page-header";

export const metadata = {
  title: "Leases",
};

export default function LeasesPage() {
  return (
    <>
      <PageHeader
        title="Leases"
        description="Track lease terms, rent, and status."
      />
      <p className="text-sm text-muted-foreground">
        Lease management coming soon. Database tables are already prepared.
      </p>
    </>
  );
}
