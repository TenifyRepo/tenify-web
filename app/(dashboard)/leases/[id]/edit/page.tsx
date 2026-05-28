import { notFound } from "next/navigation";

import { getLease, getLeaseFormOptions } from "@/actions/leases";
import { LeaseForm } from "@/components/leases/lease-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { tenantDisplayName } from "@/lib/tenant";

type EditLeasePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditLeasePageProps) {
  const { id } = await params;
  const lease = await getLease(id);
  return {
    title: lease ? `Edit lease · ${tenantDisplayName(lease.tenant)}` : "Edit lease",
  };
}

export default async function EditLeasePage({ params }: EditLeasePageProps) {
  const { id } = await params;
  const lease = await getLease(id);

  if (!lease) {
    notFound();
  }

  let options: Awaited<ReturnType<typeof getLeaseFormOptions>> = {
    tenants: [],
    properties: [],
    units: [],
  };

  try {
    options = await getLeaseFormOptions();
  } catch {
    // empty selects
  }

  return (
    <>
      <PageHeader
        title="Edit lease"
        description={tenantDisplayName(lease.tenant)}
      />
      <Card className="max-w-xl border-border/80 shadow-none">
        <CardContent className="pt-6">
          <LeaseForm mode="edit" lease={lease} options={options} />
        </CardContent>
      </Card>
    </>
  );
}
