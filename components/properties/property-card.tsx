import { MapPin, Pencil } from "lucide-react";
import Link from "next/link";

import { DeletePropertyButton } from "@/components/properties/delete-property-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Property } from "@/types/database";

function formatAddress(property: Property) {
  const parts = [
    property.address_line1,
    property.address_line2,
    property.city,
    property.state,
    property.postal_code,
  ].filter(Boolean);
  return parts.join(", ");
}

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Card className="border-border/80 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <div className="min-w-0 space-y-1">
          <CardTitle className="truncate text-base font-medium">
            {property.name}
          </CardTitle>
          {property.property_type ? (
            <Badge variant="secondary" className="capitalize">
              {property.property_type}
            </Badge>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            render={
              <Link href={`/properties/${property.id}/edit`} aria-label="Edit" />
            }
          >
            <Pencil className="size-4" />
          </Button>
          <DeletePropertyButton
            propertyId={property.id}
            propertyName={property.name}
          />
        </div>
      </CardHeader>
      <CardContent>
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" />
          <span>{formatAddress(property)}</span>
        </p>
      </CardContent>
    </Card>
  );
}
