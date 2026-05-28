import { notFound } from "next/navigation";

import { getTenant, getUnitOptionsForTenantForm } from "@/actions/tenants";
import { EntityDocumentsSection } from "@/components/documents/entity-documents-section";
import { PageHeader } from "@/components/layout/page-header";
import { TenantForm } from "@/components/tenants/tenant-form";
import { Card, CardContent } from "@/components/ui/card";
import { tenantDisplayName } from "@/lib/tenant";

type EditTenantPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditTenantPageProps) {
  const { id } = await params;
  const tenant = await getTenant(id);
  return {
    title: tenant ? `Edit ${tenantDisplayName(tenant)}` : "Edit tenant",
  };
}

export default async function EditTenantPage({ params }: EditTenantPageProps) {
  const { id } = await params;
  const tenant = await getTenant(id);

  if (!tenant) {
    notFound();
  }

  let unitOptions: Awaited<ReturnType<typeof getUnitOptionsForTenantForm>> = [];
  try {
    unitOptions = await getUnitOptionsForTenantForm();
  } catch {
    unitOptions = [];
  }

  return (
    <>
      <PageHeader
        title="Edit tenant"
        description={tenantDisplayName(tenant)}
      />
      <Card className="max-w-xl border-border/80 shadow-none">
        <CardContent className="pt-6">
          <TenantForm mode="edit" tenant={tenant} unitOptions={unitOptions} />
        </CardContent>
      </Card>

      <EntityDocumentsSection
        entityType="tenant"
        entityId={tenant.id}
        title="Identity & tenant documents"
        categories={["ID Document", "Lease Agreement", "Other"]}
      />
    </>
  );
}
