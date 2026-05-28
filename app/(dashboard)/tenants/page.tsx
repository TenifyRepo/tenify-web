import { Plus } from "lucide-react";
import Link from "next/link";

import { getTenants } from "@/actions/tenants";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyTenants } from "@/components/tenants/empty-tenants";
import { TenantCard } from "@/components/tenants/tenant-card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Tenants",
};

export default async function TenantsPage() {
  let tenants: Awaited<ReturnType<typeof getTenants>> = [];
  let loadError: string | null = null;

  try {
    tenants = await getTenants();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not load tenants";
  }

  return (
    <>
      <PageHeader
        title="Tenants"
        description="People renting your units."
      >
        <Button asChild>
          <Link href="/tenants/new">
            <Plus className="size-4" />
            Add tenant
          </Link>
        </Button>
      </PageHeader>

      {loadError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      ) : tenants.length === 0 ? (
        <EmptyTenants />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {tenants.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      )}
    </>
  );
}
