import { notFound } from "next/navigation";

import { getProperty } from "@/actions/properties";
import { PageHeader } from "@/components/layout/page-header";
import { UnitForm } from "@/components/units/unit-form";
import { Card, CardContent } from "@/components/ui/card";

type NewUnitPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: NewUnitPageProps) {
  const { id } = await params;
  const property = await getProperty(id);
  return { title: property ? `Add unit · ${property.name}` : "Add unit" };
}

export default async function NewUnitPage({ params }: NewUnitPageProps) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Add unit"
        description={property.name}
      />
      <Card className="max-w-xl border-border/80 shadow-none">
        <CardContent className="pt-6">
          <UnitForm propertyId={property.id} />
        </CardContent>
      </Card>
    </>
  );
}
