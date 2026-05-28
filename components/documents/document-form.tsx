"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useActionState } from "react";

import { getEntityOptions } from "@/actions/documents";
import {
  createDocument,
  updateDocument,
  type DocumentActionState,
  type DocumentWithUrl,
} from "@/actions/documents";
import { DocumentUploadField } from "@/components/documents/document-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DOCUMENT_CATEGORIES,
  ENTITY_TYPES,
  type EntityType,
} from "@/lib/validations/document";
import { cn } from "@/lib/utils";

const initialState: DocumentActionState = {};

type DocumentFormProps = {
  document?: DocumentWithUrl;
  mode: "create" | "edit";
  defaultEntityType?: EntityType;
  defaultEntityId?: string;
  defaultCategory?: string;
};

export function DocumentForm({
  document,
  mode,
  defaultEntityType,
  defaultEntityId,
  defaultCategory,
}: DocumentFormProps) {
  const action =
    mode === "create"
      ? createDocument
      : updateDocument.bind(null, document!.id);

  const [state, formAction, pending] = useActionState(action, initialState);
  const [entityType, setEntityType] = useState<EntityType>(
    (document?.entity_type as EntityType) ?? defaultEntityType ?? "property"
  );
  const [entityId, setEntityId] = useState(() =>
    document?.entity_id ?? defaultEntityId ?? ""
  );
  const [entityOptions, setEntityOptions] = useState<
    { id: string; label: string }[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    getEntityOptions(entityType).then((options) => {
      if (!cancelled) setEntityOptions(options);
    });
    return () => {
      cancelled = true;
    };
  }, [entityType]);

  function handleEntityTypeChange(next: string) {
    const type = next as EntityType;
    setEntityType(type);
    setEntityId("");
  }

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="space-y-6"
    >
      {state.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <fieldset className="space-y-4" disabled={pending}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="entity_type">Link to</Label>
            <select
              id="entity_type"
              name="entity_type"
              value={entityType}
              onChange={(e) => handleEntityTypeChange(e.target.value)}
              className={selectClass}
            >
              {ENTITY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="entity_id">Record</Label>
            <select
              id="entity_id"
              name="entity_id"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              className={selectClass}
              aria-invalid={!!state.fieldErrors?.entity_id}
            >
              <option value="">Select record</option>
              {entityOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <FieldError messages={state.fieldErrors?.entity_id} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={document?.title ?? ""}
            aria-invalid={!!state.fieldErrors?.title}
          />
          <FieldError messages={state.fieldErrors?.title} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            defaultValue={document?.category ?? defaultCategory ?? "Other"}
            className={selectClass}
          >
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={document?.description ?? ""}
          />
        </div>

        <DocumentUploadField required={mode === "create"} />
        {mode === "edit" && document ? (
          <p className="text-xs text-muted-foreground">
            Current file: {document.file_name}
          </p>
        ) : null}
      </fieldset>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild>
          <Link
            href={
              mode === "edit" ? `/documents/${document!.id}` : "/documents"
            }
          >
            Cancel
          </Link>
        </Button>
        <Button type="submit" disabled={pending || !entityId}>
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Upload document"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

const selectClass = cn(
  "flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none disabled:opacity-50"
);

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-sm text-destructive">{messages[0]}</p>;
}
