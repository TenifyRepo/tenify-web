import { notFound } from "next/navigation";

import { getProperty } from "@/actions/properties";
import { PageHeader } from "@/components/layout/page-header";
import { PropertyForm } from "@/components/properties/property-form";
import { Card, CardContent } from "@/components/ui/card";

type EditPropertyPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditPropertyPageProps) {
  const { id } = await params;
  const property = await getProperty(id);
  return { title: property ? `Edit ${property.name}` : "Edit property" };
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Edit property"
        description={property.name}
      />
      <Card className="max-w-xl border-border/80 shadow-none">
        <CardContent className="pt-6">
          <PropertyForm mode="edit" property={property} />
        </CardContent>
      </Card>
    </>
  );
}
