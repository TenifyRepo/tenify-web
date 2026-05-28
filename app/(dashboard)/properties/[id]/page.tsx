import { MapPin, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getUnitsWithTenantsAndLeasesByProperty } from "@/actions/leases";
import { getProperty } from "@/actions/properties";
import { EntityDocumentsSection } from "@/components/documents/entity-documents-section";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyUnits } from "@/components/units/empty-units";
import { UnitCard } from "@/components/units/unit-card";
import { Button } from "@/components/ui/button";
import { formatPropertyAddress } from "@/lib/format";

type PropertyDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  const property = await getProperty(id);
  return { title: property?.name ?? "Property" };
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  let units: Awaited<ReturnType<typeof getUnitsWithTenantsAndLeasesByProperty>> = [];
  try {
    units = await getUnitsWithTenantsAndLeasesByProperty(id);
  } catch {
    units = [];
  }
  const address = formatPropertyAddress(property);

  return (
    <>
      <PageHeader title={property.name} description={address}>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/properties/${property.id}/edit`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/properties/${property.id}/units/new`}>
              <Plus className="size-4" />
              Add unit
            </Link>
          </Button>
        </div>
      </PageHeader>

      <p className="mb-8 flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 size-4 shrink-0" />
        {address}
      </p>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Units ({units.length})
          </h2>
          {units.length > 0 ? (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/properties/${property.id}/units/new`}>
                <Plus className="size-4" />
                Add unit
              </Link>
            </Button>
          ) : null}
        </div>

        {units.length === 0 ? (
          <EmptyUnits propertyId={property.id} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {units.map((unit) => (
              <UnitCard key={unit.id} unit={unit} />
            ))}
          </div>
        )}
      </section>

      <EntityDocumentsSection
        entityType="property"
        entityId={property.id}
        title="Property documents"
      />
    </>
  );
}
