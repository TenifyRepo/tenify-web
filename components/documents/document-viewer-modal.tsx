"use client";

import { Download, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { canPreviewInBrowser } from "@/lib/documents/file-type";

type DocumentViewerModalProps = {
  url: string;
  fileName: string;
  mimeType?: string | null;
  label?: string;
  variant?: "outline" | "ghost" | "link";
  size?: "sm" | "default";
};

export function DocumentViewerModal({
  url,
  fileName,
  mimeType = null,
  label = "View file",
  variant = "outline",
  size = "sm",
}: DocumentViewerModalProps) {
  const canPreview = canPreviewInBrowser(mimeType, fileName);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant={variant} size={size} type="button">
            <Eye className="size-4" />
            {label}
          </Button>
        }
      />
      <DialogPopup>
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{fileName}</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="space-y-4 bg-muted/30 p-4">
          {canPreview ? (
            mimeType?.includes("pdf") || fileName.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={url}
                title={fileName}
                className="h-[min(70vh,720px)] w-full rounded-lg border border-border bg-background"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- signed URL
              <img
                src={url}
                alt={fileName}
                className="mx-auto max-h-[min(70vh,720px)] w-auto max-w-full rounded-lg object-contain"
              />
            )
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Preview not available for this file type. Download to open it.
            </p>
          )}
          <div className="flex justify-center">
            <Button variant="outline" size="sm" asChild>
              <a href={url} download={fileName} target="_blank" rel="noopener noreferrer">
                <Download className="size-4" />
                Download
              </a>
            </Button>
          </div>
        </DialogBody>
      </DialogPopup>
    </Dialog>
  );
}
