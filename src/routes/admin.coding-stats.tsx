import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AdminPageHeader,
  AdminTable,
  DeleteButton,
  EmptyRow,
  Field,
  OrderControls,
  SelectField,
  ToggleRow,
} from "@/components/admin/form-kit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  CODING_PLATFORMS,
  codingStatSchema,
  codingStatToForm,
  deleteRow,
  emptyCodingStat,
  listCodingStats,
  reorderRows,
  saveCodingStat,
  togglePublished,
  type CodingStatRow,
  type CodingStatValues,
} from "@/lib/admin-content";

export const Route = createFileRoute("/admin/coding-stats")({
  component: AdminCodingStats,
  head: () => ({
    meta: [
      { title: "Coding Stats | Admin" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Manually maintained competitive programming stats." },
    ],
  }),
});

type Errors = { [K in keyof CodingStatValues]?: string | undefined };

function toNumberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}

function AdminCodingStats() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<{ id: string | null; values: CodingStatValues } | null>(
    null,
  );
  const [errors, setErrors] = useState<Errors>({});

  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ["admin", "coding-stats"],
    queryFn: listCodingStats,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "coding-stats"] });

  const save = useMutation({
    mutationFn: ({ id, values }: { id: string | null; values: CodingStatValues }) =>
      saveCodingStat(id, values),
    onSuccess: () => {
      toast.success("Stat saved.");
      setEditing(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      togglePublished("coding_stats", id, value),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const reorder = useMutation({
    mutationFn: (payload: { id: string; display_order: number }[]) =>
      reorderRows("coding_stats", payload),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRow("coding_stats", id),
    onSuccess: () => {
      toast.success("Stat deleted.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const a = rows[index]!;
    const b = rows[target]!;
    const same = a.display_order === b.display_order;
    reorder.mutate([
      { id: a.id, display_order: same ? target : b.display_order },
      { id: b.id, display_order: same ? index : a.display_order },
    ]);
  }

  function set<K extends keyof CodingStatValues>(key: K, value: CodingStatValues[K]) {
    setEditing((prev) => (prev ? { ...prev, values: { ...prev.values, [key]: value } } : prev));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function submit() {
    if (!editing) return;
    const parsed = codingStatSchema.safeParse(editing.values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof CodingStatValues;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    save.mutate({ id: editing.id, values: parsed.data });
  }

  function openEdit(row: CodingStatRow) {
    setErrors({});
    setEditing({ id: row.id, values: codingStatToForm(row) });
  }

  return (
    <div>
      <AdminPageHeader
        title="Coding Stats"
        description="Manual entry only — no live platform sync."
        action={
          <Button
            onClick={() => {
              setErrors({});
              setEditing({ id: null, values: emptyCodingStat(rows.length + 1) });
            }}
          >
            <Plus className="size-4" />
            New Stat
          </Button>
        }
      />

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-400">
          {(error as Error).message}
        </p>
      )}

      <AdminTable
        columns={["Platform", "Handle", "Rating / Rank", "Solved", "Published", "Order", "Actions"]}
      >
        {isLoading && <EmptyRow colSpan={7}>Loading stats…</EmptyRow>}
        {!isLoading && rows.length === 0 && <EmptyRow colSpan={7}>No stats yet.</EmptyRow>}
        {rows.map((row, index) => (
          <tr key={row.id} className="border-t border-border">
            <td className="px-4 py-3 font-medium">{row.platform}</td>
            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.handle}</td>
            <td className="px-4 py-3 text-muted-foreground">
              {row.rating ?? "—"}
              {row.rank_label ? ` · ${row.rank_label}` : ""}
            </td>
            <td className="px-4 py-3 text-muted-foreground">{row.problems_solved ?? "—"}</td>
            <td className="px-4 py-3">
              <Switch
                checked={row.is_published}
                aria-label={`Published: ${row.platform}`}
                onCheckedChange={(value) => toggle.mutate({ id: row.id, value })}
              />
            </td>
            <td className="px-4 py-3">
              <OrderControls
                label={row.platform}
                order={row.display_order}
                canMoveUp={index > 0}
                canMoveDown={index < rows.length - 1}
                disabled={reorder.isPending}
                onMove={(direction) => move(index, direction)}
              />
            </td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
                <DeleteButton
                  label={`${row.platform} · ${row.handle}`}
                  onConfirm={() => remove.mutate(row.id)}
                  pending={remove.isPending}
                />
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit stat" : "New stat"}</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Platform"
                  value={editing.values.platform}
                  options={CODING_PLATFORMS}
                  onChange={(value) => set("platform", value as CodingStatValues["platform"])}
                  error={errors.platform}
                />
                <Field label="Handle" error={errors.handle}>
                  <Input
                    value={editing.values.handle}
                    onChange={(e) => set("handle", e.target.value)}
                  />
                </Field>
                <Field label="Rating" hint="Optional" error={errors.rating}>
                  <Input
                    type="number"
                    value={editing.values.rating ?? ""}
                    onChange={(e) => set("rating", toNumberOrNull(e.target.value))}
                  />
                </Field>
                <Field label="Rank label" hint="Optional, e.g. Knight" error={errors.rankLabel}>
                  <Input
                    value={editing.values.rankLabel}
                    onChange={(e) => set("rankLabel", e.target.value)}
                  />
                </Field>
                <Field label="Problems solved" hint="Optional" error={errors.problemsSolved}>
                  <Input
                    type="number"
                    value={editing.values.problemsSolved ?? ""}
                    onChange={(e) => set("problemsSolved", toNumberOrNull(e.target.value))}
                  />
                </Field>
                <Field label="Display order" error={errors.displayOrder}>
                  <Input
                    type="number"
                    value={editing.values.displayOrder}
                    onChange={(e) => set("displayOrder", Number(e.target.value) || 0)}
                  />
                </Field>
              </div>

              <Field label="Profile URL" error={errors.profileUrl}>
                <Input
                  value={editing.values.profileUrl}
                  onChange={(e) => set("profileUrl", e.target.value)}
                />
              </Field>

              <ToggleRow
                label="Published"
                checked={editing.values.isPublished}
                onChange={(value) => set("isPublished", value)}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)} disabled={save.isPending}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={save.isPending}>
              Save stat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
