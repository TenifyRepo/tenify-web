import { getLeaseFormOptions } from "@/actions/leases";
import { LeaseForm } from "@/components/leases/lease-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Add lease",
};

export default async function NewLeasePage() {
  let options: Awaited<ReturnType<typeof getLeaseFormOptions>> = {
    tenants: [],
    properties: [],
    units: [],
  };

  try {
    options = await getLeaseFormOptions();
  } catch {
    // form will show empty selects
  }

  return (
    <>
      <PageHeader
        title="Add lease"
        description="Link a tenant to a unit with rent and dates."
      />
      <Card className="max-w-xl border-border/80 shadow-none">
        <CardContent className="pt-6">
          <LeaseForm mode="create" options={options} />
        </CardContent>
      </Card>
    </>
  );
}
