import { createFileRoute } from "@tanstack/react-router";

import { ProjectForm } from "@/components/admin/project-form";

export const Route = createFileRoute("/admin/projects/new")({
  component: NewProjectPage,
  head: () => ({
    meta: [
      { title: "New Project | Admin" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Create a new portfolio project." },
    ],
  }),
});

function NewProjectPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">New project</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Drafts stay hidden from the public site until you publish them.
      </p>
      <div className="mt-6">
        <ProjectForm />
      </div>
    </div>
  );
}
