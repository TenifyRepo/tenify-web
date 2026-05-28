import { notFound } from "next/navigation";

import { getLease } from "@/actions/leases";
import { EntityDocumentsSection } from "@/components/documents/entity-documents-section";
import { LeaseDetail } from "@/components/leases/lease-detail";
import { PageHeader } from "@/components/layout/page-header";
import { tenantDisplayName } from "@/lib/tenant";

type LeaseDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: LeaseDetailPageProps) {
  const { id } = await params;
  const lease = await getLease(id);
  return {
    title: lease ? `Lease · ${tenantDisplayName(lease.tenant)}` : "Lease",
  };
}

export default async function LeaseDetailPage({ params }: LeaseDetailPageProps) {
  const { id } = await params;
  const lease = await getLease(id);

  if (!lease) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Lease"
        description={tenantDisplayName(lease.tenant)}
      />
      <LeaseDetail lease={lease} />
      <EntityDocumentsSection
        entityType="lease"
        entityId={lease.id}
        title="Lease documents"
      />
    </>
  );
}
