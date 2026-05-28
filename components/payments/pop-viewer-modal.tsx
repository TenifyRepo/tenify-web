"use client";

import { FileImage } from "lucide-react";

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

type PopViewerModalProps = {
  url: string;
  label?: string;
  variant?: "outline" | "ghost" | "link";
  size?: "sm" | "default";
};

function isPdfUrl(url: string) {
  const lower = url.split("?")[0]?.toLowerCase() ?? "";
  return lower.endsWith(".pdf");
}

export function PopViewerModal({
  url,
  label = "View proof of payment",
  variant = "outline",
  size = "sm",
}: PopViewerModalProps) {
  const isPdf = isPdfUrl(url);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant={variant} size={size} type="button">
            <FileImage className="size-4" />
            {label}
          </Button>
        }
      />
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Proof of payment</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="flex items-center justify-center bg-muted/30 p-2 sm:p-4">
          {isPdf ? (
            <iframe
              src={url}
              title="Proof of payment PDF"
              className="h-[min(70vh,720px)] w-full rounded-lg border border-border bg-background"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- signed Supabase URL
            <img
              src={url}
              alt="Proof of payment"
              className="max-h-[min(70vh,720px)] w-auto max-w-full rounded-lg object-contain"
            />
          )}
        </DialogBody>
      </DialogPopup>
    </Dialog>
  );
}
