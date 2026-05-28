import { FileUp, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type EmptyDocumentsProps = {
  href?: string;
};

export function EmptyDocuments({ href = "/documents/new" }: EmptyDocumentsProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <FileUp className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-medium">No documents yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Upload leases, IDs, inspections, and other files in one place.
      </p>
      <Button className="mt-6" size="sm" asChild>
        <Link href={href}>
          <Plus className="size-4" />
          Upload document
        </Link>
      </Button>
    </div>
  );
}
