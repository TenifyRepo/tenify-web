import { Plus, Users } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function EmptyTenants() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <Users className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">No tenants yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Add a tenant in seconds. You can link them to a unit later.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/tenants/new">
          <Plus className="size-4" />
          Add tenant
        </Link>
      </Button>
    </div>
  );
}
