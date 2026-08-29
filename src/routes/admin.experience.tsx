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
  TagInput,
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
import { Textarea } from "@/components/ui/textarea";
import {
  deleteRow,
  emptyExperience,
  experienceSchema,
  experienceToForm,
  listExperience,
  reorderRows,
  saveExperience,
  togglePublished,
  type ExperienceRow,
  type ExperienceValues,
} from "@/lib/admin-content";
import { formatMonthYear } from "@/lib/content";

export const Route = createFileRoute("/admin/experience")({
  component: AdminExperience,
  head: () => ({
    meta: [
      { title: "Experience | Admin" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Manage work experience entries." },
    ],
  }),
});

type Errors = { [K in keyof ExperienceValues]?: string | undefined };

function AdminExperience() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<{ id: string | null; values: ExperienceValues } | null>(
    null,
  );
  const [errors, setErrors] = useState<Errors>({});

  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ["admin", "experience"],
    queryFn: listExperience,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "experience"] });

  const save = useMutation({
    mutationFn: ({ id, values }: { id: string | null; values: ExperienceValues }) =>
      saveExperience(id, values),
    onSuccess: () => {
      toast.success("Experience saved.");
      setEditing(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      togglePublished("experience", id, value),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const reorder = useMutation({
    mutationFn: (payload: { id: string; display_order: number }[]) =>
      reorderRows("experience", payload),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRow("experience", id),
    onSuccess: () => {
      toast.success("Entry deleted.");
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

  function submit() {
    if (!editing) return;
    const parsed = experienceSchema.safeParse(editing.values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ExperienceValues;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    save.mutate({ id: editing.id, values: parsed.data });
  }

  function set<K extends keyof ExperienceValues>(key: K, value: ExperienceValues[K]) {
    setEditing((prev) => (prev ? { ...prev, values: { ...prev.values, [key]: value } } : prev));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function openNew() {
    setErrors({});
    setEditing({ id: null, values: emptyExperience(rows.length + 1) });
  }

  function openEdit(row: ExperienceRow) {
    setErrors({});
    setEditing({ id: row.id, values: experienceToForm(row) });
  }

  return (
    <div>
      <AdminPageHeader
        title="Experience"
        description={`${rows.length} role${rows.length === 1 ? "" : "s"} · toggles save instantly`}
        action={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            New Role
          </Button>
        }
      />

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-400">
          {(error as Error).message}
        </p>
      )}

      <AdminTable columns={["Company", "Role", "Dates", "Published", "Order", "Actions"]}>
        {isLoading && <EmptyRow colSpan={6}>Loading experience…</EmptyRow>}
        {!isLoading && rows.length === 0 && <EmptyRow colSpan={6}>No roles yet.</EmptyRow>}
        {rows.map((row, index) => (
          <tr key={row.id} className="border-t border-border">
            <td className="px-4 py-3 font-medium">{row.company}</td>
            <td className="px-4 py-3 text-muted-foreground">{row.role}</td>
            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
              {formatMonthYear(row.start_date)} — {formatMonthYear(row.end_date) ?? "Present"}
            </td>
            <td className="px-4 py-3">
              <Switch
                checked={row.is_published}
                aria-label={`Published: ${row.company}`}
                onCheckedChange={(value) => toggle.mutate({ id: row.id, value })}
              />
            </td>
            <td className="px-4 py-3">
              <OrderControls
                label={row.company}
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
                  label={`${row.role} @ ${row.company}`}
                  onConfirm={() => remove.mutate(row.id)}
                  pending={remove.isPending}
                />
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit role" : "New role"}</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Company" error={errors.company}>
                  <Input
                    value={editing.values.company}
                    onChange={(e) => set("company", e.target.value)}
                  />
                </Field>
                <Field label="Role" error={errors.role}>
                  <Input value={editing.values.role} onChange={(e) => set("role", e.target.value)} />
                </Field>
                <Field label="Location" error={errors.location}>
                  <Input
                    value={editing.values.location}
                    onChange={(e) => set("location", e.target.value)}
                  />
                </Field>
                <Field label="Display order" error={errors.displayOrder}>
                  <Input
                    type="number"
                    value={editing.values.displayOrder}
                    onChange={(e) => set("displayOrder", Number(e.target.value) || 0)}
                  />
                </Field>
                <Field label="Start date" error={errors.startDate}>
                  <Input
                    type="date"
                    value={editing.values.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                  />
                </Field>
                <Field
                  label="End date"
                  hint="Leave blank for a current role."
                  error={errors.endDate}
                >
                  <Input
                    type="date"
                    value={editing.values.endDate}
                    onChange={(e) => set("endDate", e.target.value)}
                  />
                </Field>
              </div>

              <Field
                label="Highlights"
                hint="One bullet per line."
                error={errors.description}
              >
                <Textarea
                  rows={6}
                  value={editing.values.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>

              <Field label="Stack tags" error={errors.stackTags}>
                <TagInput
                  tags={editing.values.stackTags}
                  onChange={(tags) => set("stackTags", tags)}
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
              Save role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
