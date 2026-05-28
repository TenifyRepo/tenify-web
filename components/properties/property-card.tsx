import { Building2, MapPin, Pencil } from "lucide-react";
import Link from "next/link";

import type { PropertyWithUnitCount } from "@/actions/properties";
import { DeletePropertyButton } from "@/components/properties/delete-property-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPropertyAddress } from "@/lib/format";

export function PropertyCard({ property }: { property: PropertyWithUnitCount }) {
  const unitLabel =
    property.unit_count === 1 ? "1 unit" : `${property.unit_count} units`;

  return (
    <Card className="border-border/80 shadow-none transition-colors hover:border-border">
      <Link href={`/properties/${property.id}`} className="block">
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="truncate text-base font-medium">
              {property.name}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {property.property_type ? (
                <Badge variant="secondary" className="capitalize">
                  {property.property_type}
                </Badge>
              ) : null}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="size-3.5" />
                {unitLabel}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span>{formatPropertyAddress(property)}</span>
          </p>
        </CardContent>
      </Link>
      <div className="flex justify-end gap-0.5 border-t border-border/60 px-3 py-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link
            href={`/properties/${property.id}/edit`}
            aria-label={`Edit ${property.name}`}
          >
            <Pencil className="size-4" />
          </Link>
        </Button>
        <DeletePropertyButton
          propertyId={property.id}
          propertyName={property.name}
        />
      </div>
    </Card>
  );
}
