"use client";

import { FileUp } from "lucide-react";
import { useState } from "react";

import { PopViewerModal } from "@/components/payments/pop-viewer-modal";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PopUploadFieldProps = {
  existingFile?: boolean;
  existingUrl?: string | null;
};

export function PopUploadField({
  existingFile,
  existingUrl,
}: PopUploadFieldProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [removePop, setRemovePop] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor="pop_file">Proof of payment</Label>
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 py-8 text-center",
          "hover:bg-muted/30"
        )}
      >
        <FileUp className="mb-2 size-8 text-muted-foreground" />
        <p className="text-sm font-medium">Upload image or PDF</p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPEG, PNG, WebP, GIF, or PDF · max 10 MB
        </p>
        <label className="mt-4 cursor-pointer">
          <span className="inline-flex h-8 items-center rounded-lg border border-input bg-background px-3 text-sm font-medium">
            Choose file
          </span>
          <input
            id="pop_file"
            name="pop_file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setFileName(file?.name ?? null);
              if (file) setRemovePop(false);
            }}
          />
        </label>
        {fileName ? (
          <p className="mt-2 text-xs text-muted-foreground">{fileName}</p>
        ) : null}
      </div>

      {existingFile && existingUrl ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-sm">
          {!removePop ? (
            <PopViewerModal
              url={existingUrl}
              label="View current proof"
              variant="link"
              size="default"
            />
          ) : (
            <span className="text-muted-foreground">File will be removed</span>
          )}
          <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              checked={removePop}
              onChange={(e) => setRemovePop(e.target.checked)}
              className="size-4 rounded border-input"
            />
            Remove file
          </label>
        </div>
      ) : null}

      {removePop ? (
        <input type="hidden" name="remove_pop" value="true" />
      ) : null}
    </div>
  );
}
