import { PageHeader } from "@/components/layout/page-header";
import { PropertyForm } from "@/components/properties/property-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Add property",
};

export default function NewPropertyPage() {
  return (
    <>
      <PageHeader
        title="Add property"
        description="Just the essentials — you can add units later."
      />
      <Card className="max-w-xl border-border/80 shadow-none">
        <CardContent className="pt-6">
          <PropertyForm mode="create" />
        </CardContent>
      </Card>
    </>
  );
}
