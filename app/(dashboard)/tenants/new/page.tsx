import { getUnitOptionsForTenantForm } from "@/actions/tenants";
import { PageHeader } from "@/components/layout/page-header";
import { TenantForm } from "@/components/tenants/tenant-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Add tenant",
};

export default async function NewTenantPage() {
  let unitOptions: Awaited<ReturnType<typeof getUnitOptionsForTenantForm>> = [];
  try {
    unitOptions = await getUnitOptionsForTenantForm();
  } catch {
    unitOptions = [];
  }

  return (
    <>
      <PageHeader
        title="Add tenant"
        description="Just the basics — link a unit if you want."
      />
      <Card className="max-w-xl border-border/80 shadow-none">
        <CardContent className="pt-6">
          <TenantForm mode="create" unitOptions={unitOptions} />
        </CardContent>
      </Card>
    </>
  );
}
