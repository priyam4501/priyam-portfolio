import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ProjectForm } from "@/components/admin/project-form";
import { getAdminProject, rowToForm } from "@/lib/admin-projects";

export const Route = createFileRoute("/admin/projects/$id/edit")({
  component: EditProjectPage,
  head: () => ({
    meta: [
      { title: "Edit Project | Admin" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Edit a portfolio project." },
    ],
  }),
});

function EditProjectPage() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "project", id],
    queryFn: () => getAdminProject(id),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Edit project</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {data ? `/${data.slug}` : "Loading…"}
      </p>
      <div className="mt-6">
        {isLoading && <p className="text-sm text-muted-foreground">Loading project…</p>}
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {(error as Error).message}
          </p>
        )}
        {data && <ProjectForm projectId={data.id} initialValues={rowToForm(data)} />}
      </div>
    </div>
  );
}
