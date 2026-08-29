import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";
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
  ICON_KEYS,
  SKILL_CATEGORIES,
  deleteRow,
  emptySkill,
  listSkills,
  reorderRows,
  saveSkill,
  skillSchema,
  skillToForm,
  togglePublished,
  type SkillRow,
  type SkillValues,
} from "@/lib/admin-content";

export const Route = createFileRoute("/admin/skills")({
  component: AdminSkills,
  head: () => ({
    meta: [
      { title: "Skills | Admin" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Manage skills and proficiency levels." },
    ],
  }),
});

type Errors = { [K in keyof SkillValues]?: string | undefined };

function AdminSkills() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("All");
  const [editing, setEditing] = useState<{ id: string | null; values: SkillValues } | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ["admin", "skills"],
    queryFn: listSkills,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "skills"] });

  const visible = useMemo(
    () => (filter === "All" ? rows : rows.filter((row) => row.category === filter)),
    [rows, filter],
  );

  const save = useMutation({
    mutationFn: ({ id, values }: { id: string | null; values: SkillValues }) => saveSkill(id, values),
    onSuccess: () => {
      toast.success("Skill saved.");
      setEditing(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      togglePublished("skills", id, value),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const reorder = useMutation({
    mutationFn: (payload: { id: string; display_order: number }[]) => reorderRows("skills", payload),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRow("skills", id),
    onSuccess: () => {
      toast.success("Skill deleted.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= visible.length) return;
    const a = visible[index]!;
    const b = visible[target]!;
    const same = a.display_order === b.display_order;
    reorder.mutate([
      { id: a.id, display_order: same ? target : b.display_order },
      { id: b.id, display_order: same ? index : a.display_order },
    ]);
  }

  function set<K extends keyof SkillValues>(key: K, value: SkillValues[K]) {
    setEditing((prev) => (prev ? { ...prev, values: { ...prev.values, [key]: value } } : prev));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function submit() {
    if (!editing) return;
    const parsed = skillSchema.safeParse(editing.values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof SkillValues;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    save.mutate({ id: editing.id, values: parsed.data });
  }

  function openEdit(row: SkillRow) {
    setErrors({});
    setEditing({ id: row.id, values: skillToForm(row) });
  }

  return (
    <div>
      <AdminPageHeader
        title="Skills"
        description={`${rows.length} skill${rows.length === 1 ? "" : "s"} across ${SKILL_CATEGORIES.length} categories`}
        action={
          <Button
            onClick={() => {
              setErrors({});
              setEditing({ id: null, values: emptySkill(rows.length + 1) });
            }}
          >
            <Plus className="size-4" />
            New Skill
          </Button>
        }
      />

      <div className="mt-5 flex flex-wrap gap-2">
        {["All", ...SKILL_CATEGORIES].map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setFilter(category)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              filter === category
                ? "border-accent text-accent"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-400">
          {(error as Error).message}
        </p>
      )}

      <AdminTable
        columns={["Skill", "Category", "Proficiency", "Icon", "Published", "Order", "Actions"]}
      >
        {isLoading && <EmptyRow colSpan={7}>Loading skills…</EmptyRow>}
        {!isLoading && visible.length === 0 && <EmptyRow colSpan={7}>No skills here yet.</EmptyRow>}
        {visible.map((row, index) => (
          <tr key={row.id} className="border-t border-border">
            <td className="px-4 py-3 font-medium">{row.name}</td>
            <td className="px-4 py-3 text-muted-foreground">{row.category}</td>
            <td className="px-4 py-3">
              <span className="flex gap-1" aria-label={`Proficiency ${row.proficiency} of 5`}>
                {[1, 2, 3, 4, 5].map((dot) => (
                  <span
                    key={dot}
                    className={`size-1.5 rounded-full ${
                      dot <= row.proficiency ? "bg-accent" : "bg-border"
                    }`}
                  />
                ))}
              </span>
            </td>
            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
              {row.icon_key ?? "—"}
            </td>
            <td className="px-4 py-3">
              <Switch
                checked={row.is_published}
                aria-label={`Published: ${row.name}`}
                onCheckedChange={(value) => toggle.mutate({ id: row.id, value })}
              />
            </td>
            <td className="px-4 py-3">
              <OrderControls
                label={row.name}
                order={row.display_order}
                canMoveUp={index > 0}
                canMoveDown={index < visible.length - 1}
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
                  label={row.name}
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
            <DialogTitle>{editing?.id ? "Edit skill" : "New skill"}</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-4">
              <Field label="Name" error={errors.name}>
                <Input value={editing.values.name} onChange={(e) => set("name", e.target.value)} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Category"
                  value={editing.values.category}
                  options={SKILL_CATEGORIES}
                  onChange={(value) => set("category", value as SkillValues["category"])}
                  error={errors.category}
                />
                <SelectField
                  label="Icon"
                  value={editing.values.iconKey}
                  options={ICON_KEYS}
                  onChange={(value) => set("iconKey", value)}
                  error={errors.iconKey}
                />
              </div>

              <Field label={`Proficiency: ${editing.values.proficiency} / 5`} error={errors.proficiency}>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => set("proficiency", level)}
                      aria-label={`Set proficiency ${level}`}
                      aria-pressed={editing.values.proficiency === level}
                      className={`h-9 flex-1 rounded-md border text-sm transition ${
                        editing.values.proficiency >= level
                          ? "border-accent text-accent"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Display order" error={errors.displayOrder}>
                <Input
                  type="number"
                  value={editing.values.displayOrder}
                  onChange={(e) => set("displayOrder", Number(e.target.value) || 0)}
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
              Save skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
