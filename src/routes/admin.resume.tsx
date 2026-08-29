import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, FileText, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AdminPageHeader,
  AdminTable,
  DeleteButton,
  EmptyRow,
  Field,
} from "@/components/admin/form-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteResume,
  formatBytes,
  listResumes,
  setActiveResume,
  uploadResume,
  validatePdf,
} from "@/lib/admin-content";

export const Route = createFileRoute("/admin/resume")({
  component: AdminResume,
  head: () => ({
    meta: [
      { title: "Resume | Admin" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Upload resume versions and pick the active one." },
    ],
  }),
});

function AdminResume() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);

  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ["admin", "resumes"],
    queryFn: listResumes,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "resumes"] });

  const upload = useMutation({
    mutationFn: ({ pdf, versionLabel }: { pdf: File; versionLabel: string }) =>
      uploadResume(pdf, versionLabel, rows.length === 0),
    onSuccess: () => {
      toast.success("Resume uploaded.");
      setFile(null);
      setLabel("");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activate = useMutation({
    mutationFn: (id: string) => setActiveResume(id),
    onSuccess: () => {
      toast.success("Active resume updated.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteResume(id),
    onSuccess: () => {
      toast.success("Version deleted.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function pick(next: File | undefined) {
    if (!next) return;
    const invalid = validatePdf(next);
    setFileError(invalid);
    setFile(invalid ? null : next);
  }

  return (
    <div>
      <AdminPageHeader
        title="Resume"
        description="PDF only, max 10MB. Exactly one version is active at a time."
      />

      <div className="mt-6 max-w-2xl space-y-4 rounded-xl border border-border bg-surface/40 p-5">
        <Field label="PDF file" error={fileError ?? undefined}>
          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-border px-4 py-4 text-sm hover:border-accent">
            <Upload className="size-4 text-muted-foreground" />
            {file ? `${file.name} · ${formatBytes(file.size)}` : "Choose a PDF"}
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              aria-label="Choose a PDF"
              onChange={(e) => pick(e.target.files?.[0])}
            />
          </label>
        </Field>

        <Field label="Version label" hint="e.g. 2026-02 · Backend focus">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} />
        </Field>

        <Button
          disabled={!file || upload.isPending}
          onClick={() => file && upload.mutate({ pdf: file, versionLabel: label.trim() })}
        >
          {upload.isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Upload version
        </Button>
      </div>

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-400">
          {(error as Error).message}
        </p>
      )}

      <AdminTable columns={["Version", "Size", "Uploaded", "Status", "Actions"]} minWidth={680}>
        {isLoading && <EmptyRow colSpan={5}>Loading versions…</EmptyRow>}
        {!isLoading && rows.length === 0 && <EmptyRow colSpan={5}>No resume uploaded yet.</EmptyRow>}
        {rows.map((row) => (
          <tr key={row.id} className="border-t border-border">
            <td className="px-4 py-3">
              <a
                href={row.file_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-medium hover:text-accent"
              >
                <FileText className="size-4 text-muted-foreground" />
                {row.version_label || "Untitled version"}
              </a>
            </td>
            <td className="px-4 py-3 text-muted-foreground">{row.file_size_label ?? "—"}</td>
            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
              {new Date(row.created_at).toISOString().slice(0, 10)}
            </td>
            <td className="px-4 py-3">
              {row.is_active ? (
                <span className="inline-flex items-center gap-1 text-xs text-accent">
                  <CheckCircle2 className="size-3.5" /> Active
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Archived</span>
              )}
            </td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={row.is_active || activate.isPending}
                  onClick={() => activate.mutate(row.id)}
                >
                  Set Active
                </Button>
                <DeleteButton
                  label={row.version_label || "this version"}
                  onConfirm={() => remove.mutate(row.id)}
                  pending={remove.isPending}
                />
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
