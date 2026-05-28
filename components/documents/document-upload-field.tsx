"use client";

import { FileUp } from "lucide-react";
import { useCallback, useState } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type DocumentUploadFieldProps = {
  required?: boolean;
};

export function DocumentUploadField({ required = true }: DocumentUploadFieldProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const onFiles = useCallback((files: FileList | null) => {
    const file = files?.[0];
    setFileName(file?.name ?? null);
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="file">
        File {required ? "" : "(optional — leave empty to keep current)"}
      </Label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const input = document.getElementById("file") as HTMLInputElement | null;
          if (input && e.dataTransfer.files[0]) {
            const dt = new DataTransfer();
            dt.items.add(e.dataTransfer.files[0]);
            input.files = dt.files;
            onFiles(input.files);
          }
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"
        )}
      >
        <FileUp className="mb-2 size-8 text-muted-foreground" />
        <p className="text-sm font-medium">Drag and drop or choose a file</p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, images, or Word · max 15 MB
        </p>
        <label className="mt-4 cursor-pointer">
          <span className="inline-flex h-8 items-center rounded-lg border border-input bg-background px-3 text-sm font-medium">
            Choose file
          </span>
          <input
            id="file"
            name="file"
            type="file"
            required={required}
            accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
        {fileName ? (
          <p className="mt-2 text-xs text-muted-foreground">{fileName}</p>
        ) : null}
      </div>
    </div>
  );
}
