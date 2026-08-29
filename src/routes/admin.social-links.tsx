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
  SOCIAL_PLATFORMS,
  deleteRow,
  emptySocialLink,
  listSocialLinks,
  reorderRows,
  saveSocialLink,
  socialLinkSchema,
  socialLinkToForm,
  togglePublished,
  type SocialLinkRow,
  type SocialLinkValues,
} from "@/lib/admin-content";

export const Route = createFileRoute("/admin/social-links")({
  component: AdminSocialLinks,
  head: () => ({
    meta: [
      { title: "Social Links | Admin" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Manage social and profile links." },
    ],
  }),
});

type Errors = { [K in keyof SocialLinkValues]?: string | undefined };

function AdminSocialLinks() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<{ id: string | null; values: SocialLinkValues } | null>(
    null,
  );
  const [errors, setErrors] = useState<Errors>({});

  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ["admin", "social-links"],
    queryFn: listSocialLinks,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "social-links"] });

  const save = useMutation({
    mutationFn: ({ id, values }: { id: string | null; values: SocialLinkValues }) =>
      saveSocialLink(id, values),
    onSuccess: () => {
      toast.success("Link saved.");
      setEditing(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      togglePublished("social_links", id, value),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const reorder = useMutation({
    mutationFn: (payload: { id: string; display_order: number }[]) =>
      reorderRows("social_links", payload),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRow("social_links", id),
    onSuccess: () => {
      toast.success("Link deleted.");
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

  function set<K extends keyof SocialLinkValues>(key: K, value: SocialLinkValues[K]) {
    setEditing((prev) => (prev ? { ...prev, values: { ...prev.values, [key]: value } } : prev));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function submit() {
    if (!editing) return;
    const parsed = socialLinkSchema.safeParse(editing.values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof SocialLinkValues;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    save.mutate({ id: editing.id, values: parsed.data });
  }

  function openEdit(row: SocialLinkRow) {
    setErrors({});
    setEditing({ id: row.id, values: socialLinkToForm(row) });
  }

  return (
    <div>
      <AdminPageHeader
        title="Social Links"
        description="Links shown in the footer and contact page."
        action={
          <Button
            onClick={() => {
              setErrors({});
              setEditing({ id: null, values: emptySocialLink(rows.length + 1) });
            }}
          >
            <Plus className="size-4" />
            New Link
          </Button>
        }
      />

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-400">
          {(error as Error).message}
        </p>
      )}

      <AdminTable columns={["Platform", "URL", "Published", "Order", "Actions"]}>
        {isLoading && <EmptyRow colSpan={5}>Loading links…</EmptyRow>}
        {!isLoading && rows.length === 0 && <EmptyRow colSpan={5}>No links yet.</EmptyRow>}
        {rows.map((row, index) => (
          <tr key={row.id} className="border-t border-border">
            <td className="px-4 py-3 font-medium">{row.platform}</td>
            <td className="max-w-[320px] truncate px-4 py-3 font-mono text-xs text-muted-foreground">
              {row.url}
            </td>
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
                  label={row.platform}
                  onConfirm={() => remove.mutate(row.id)}
                  pending={remove.isPending}
                />
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit link" : "New link"}</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-4">
              <SelectField
                label="Platform"
                value={editing.values.platform}
                options={SOCIAL_PLATFORMS}
                onChange={(value) => set("platform", value as SocialLinkValues["platform"])}
                error={errors.platform}
              />
              <Field
                label="URL"
                hint="Use a full https:// URL, or mailto: for email."
                error={errors.url}
              >
                <Input value={editing.values.url} onChange={(e) => set("url", e.target.value)} />
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
              Save link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
