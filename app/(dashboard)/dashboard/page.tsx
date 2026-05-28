import { Building2, Plus } from "lucide-react";
import Link from "next/link";

import { getProperties } from "@/actions/properties";
import { PageHeader } from "@/components/layout/page-header";
import { PropertyCard } from "@/components/properties/property-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  let properties: Awaited<ReturnType<typeof getProperties>> = [];
  let loadError: string | null = null;

  try {
    properties = await getProperties();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not load properties";
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A quick overview of your portfolio."
      >
        <Button render={<Link href="/properties/new" />}>
          <Plus className="size-4" />
          Add property
        </Button>
      </PageHeader>

      {loadError ? (
        <Card className="border-destructive/30 bg-destructive/5 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Setup required</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ol className="list-decimal space-y-1 pl-4">
              <li>Run the SQL migration in Supabase</li>
              <li>Copy <code>.env.example</code> to <code>.env.local</code></li>
              <li>Set your Supabase URL and anon key</li>
              <li>
                Create a landlord row and set <code>DEV_LANDLORD_ID</code>
              </li>
            </ol>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Properties"
              value={properties.length}
              icon={Building2}
            />
            <StatCard label="Units" value="—" hint="Coming soon" />
            <StatCard label="Active leases" value="—" hint="Coming soon" />
          </div>

          {properties.length > 0 ? (
            <section>
              <h2 className="mb-4 text-sm font-medium text-muted-foreground">
                Recent properties
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {properties.slice(0, 4).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </section>
          ) : (
            <Card className="border-dashed shadow-none">
              <CardContent className="flex flex-col items-center py-12 text-center">
                <Building2 className="mb-3 size-8 text-muted-foreground" />
                <p className="font-medium">No properties yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add one in under a minute.
                </p>
                <Button className="mt-4" render={<Link href="/properties/new" />}>
                  <Plus className="size-4" />
                  Add property
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  hint?: string;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2">
          {Icon ? <Icon className="size-4" /> : null}
          {label}
        </CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        {hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardHeader>
    </Card>
  );
}
