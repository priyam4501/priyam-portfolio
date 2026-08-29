import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  deleteProject,
  listAdminProjects,
  setDisplayOrder,
  setProjectFlag,
  type AdminProjectRow,
} from "@/lib/admin-projects";

export const Route = createFileRoute("/admin/projects/")({
  component: AdminProjectsList,
  head: () => ({
    meta: [
      { title: "Projects | Admin" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Manage portfolio projects." },
    ],
  }),
});

function AdminProjectsList() {
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<AdminProjectRow | null>(null);

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ["admin", "projects"],
    queryFn: listAdminProjects,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });

  const toggle = useMutation({
    mutationFn: ({
      id,
      field,
      value,
    }: {
      id: string;
      field: "is_published" | "is_featured";
      value: boolean;
    }) => setProjectFlag(id, field, value),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const reorder = useMutation({
    mutationFn: setDisplayOrder,
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      toast.success("Project deleted.");
      setPendingDelete(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;
    const a = projects[index]!;
    const b = projects[target]!;
    reorder.mutate([
      { id: a.id, display_order: b.display_order === a.display_order ? target : b.display_order },
      { id: b.id, display_order: b.display_order === a.display_order ? index : a.display_order },
    ]);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {projects.length} project{projects.length === 1 ? "" : "s"} · toggles save instantly
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/projects/new">
            <Plus className="size-4" />
            New Project
          </Link>
        </Button>
      </div>

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-400">
          {(error as Error).message}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-surface/50 text-left">
            <tr className="label-mono text-xs text-muted-foreground">
              <th className="px-4 py-3 font-normal">Cover</th>
              <th className="px-4 py-3 font-normal">Title</th>
              <th className="px-4 py-3 font-normal">Category</th>
              <th className="px-4 py-3 font-normal">Published</th>
              <th className="px-4 py-3 font-normal">Featured</th>
              <th className="px-4 py-3 font-normal">Order</th>
              <th className="px-4 py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Loading projects…
                </td>
              </tr>
            )}
            {!isLoading && projects.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No projects yet.
                </td>
              </tr>
            )}
            {projects.map((project, index) => (
              <tr key={project.id} className="border-t border-border">
                <td className="px-4 py-3">
                  {project.cover_image_url ? (
                    <img
                      src={project.cover_image_url}
                      alt=""
                      className="h-10 w-16 rounded object-cover"
                    />
                  ) : (
                    <div className="visual-shell h-10 w-16 rounded" aria-hidden />
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{project.title}</p>
                  <p className="font-mono text-xs text-muted-foreground">/{project.slug}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{project.category}</td>
                <td className="px-4 py-3">
                  <Switch
                    checked={project.is_published}
                    aria-label={`Published: ${project.title}`}
                    onCheckedChange={(value) =>
                      toggle.mutate({ id: project.id, field: "is_published", value })
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <Switch
                    checked={project.is_featured}
                    aria-label={`Featured: ${project.title}`}
                    onCheckedChange={(value) =>
                      toggle.mutate({ id: project.id, field: "is_featured", value })
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs text-muted-foreground">
                      {project.display_order}
                    </span>
                    <button
                      type="button"
                      aria-label={`Move ${project.title} up`}
                      disabled={index === 0 || reorder.isPending}
                      onClick={() => move(index, -1)}
                      className="rounded border border-border p-1 text-muted-foreground transition hover:text-accent disabled:opacity-30"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${project.title} down`}
                      disabled={index === projects.length - 1 || reorder.isPending}
                      onClick={() => move(index, 1)}
                      className="rounded border border-border p-1 text-muted-foreground transition hover:text-accent disabled:opacity-30"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/admin/projects/$id/edit" params={{ id: project.id }}>
                        <Pencil className="size-3.5" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingDelete(project)}
                      aria-label={`Delete ${project.title}`}
                    >
                      <Trash2 className="size-3.5 text-red-400" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{pendingDelete?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the project and its public page. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && remove.mutate(pendingDelete.id)}
              disabled={remove.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
