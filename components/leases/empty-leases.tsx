import { FileText, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function EmptyLeases() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <FileText className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">No leases yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Link a tenant to a unit with rent and dates.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/leases/new">
          <Plus className="size-4" />
          Add lease
        </Link>
      </Button>
    </div>
  );
}
