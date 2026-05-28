import { DoorOpen, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type EmptyUnitsProps = {
  propertyId: string;
};

export function EmptyUnits({ propertyId }: EmptyUnitsProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <DoorOpen className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">No units yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Add units to track rent, occupancy, and leases per space.
      </p>
      <Button className="mt-6" asChild>
        <Link href={`/properties/${propertyId}/units/new`}>
          <Plus className="size-4" />
          Add unit
        </Link>
      </Button>
    </div>
  );
}
