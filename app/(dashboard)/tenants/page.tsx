import { PageHeader } from "@/components/layout/page-header";

export const metadata = {
  title: "Tenants",
};

export default function TenantsPage() {
  return (
    <>
      <PageHeader
        title="Tenants"
        description="Manage tenant profiles and contact details."
      />
      <p className="text-sm text-muted-foreground">
        Tenant management is next on the roadmap. Properties are live now.
      </p>
    </>
  );
}
