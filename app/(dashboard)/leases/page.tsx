import { Plus } from "lucide-react";
import Link from "next/link";

import { getLeases } from "@/actions/leases";
import { EmptyLeases } from "@/components/leases/empty-leases";
import { LeaseCard } from "@/components/leases/lease-card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Leases",
};

export default async function LeasesPage() {
  let leases: Awaited<ReturnType<typeof getLeases>> = [];
  let loadError: string | null = null;

  try {
    leases = await getLeases();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not load leases";
  }

  return (
    <>
      <PageHeader
        title="Leases"
        description="Rent agreements linked to tenants and units."
      >
        <Button asChild>
          <Link href="/leases/new">
            <Plus className="size-4" />
            Add lease
          </Link>
        </Button>
      </PageHeader>

      {loadError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      ) : leases.length === 0 ? (
        <EmptyLeases />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {leases.map((lease) => (
            <LeaseCard key={lease.id} lease={lease} />
          ))}
        </div>
      )}
    </>
  );
}
