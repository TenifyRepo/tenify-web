import { Plus } from "lucide-react";
import Link from "next/link";

import { getProperties } from "@/actions/properties";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyProperties } from "@/components/properties/empty-properties";
import { PropertyCard } from "@/components/properties/property-card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Properties",
};

export default async function PropertiesPage() {
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
        title="Properties"
        description="All buildings and addresses you manage."
      >
        <Button asChild>
          <Link href="/properties/new">
            <Plus className="size-4" />
            Add property
          </Link>
        </Button>
      </PageHeader>

      {loadError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      ) : properties.length === 0 ? (
        <EmptyProperties />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </>
  );
}
