import { Plus, Receipt } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function EmptyInvoices() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <Receipt className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">No invoices yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Create an invoice from a lease to track rent billing.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/invoices/new">
          <Plus className="size-4" />
          Create invoice
        </Link>
      </Button>
    </div>
  );
}
