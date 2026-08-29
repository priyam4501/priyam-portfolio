import { createFileRoute } from "@tanstack/react-router";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Timeline } from "@/components/experience/timeline";
import { getExperienceData } from "@/lib/content.functions";

export const Route = createFileRoute("/experience")({
  loader: () => getExperienceData(),
  head: () => ({
    meta: [
      { title: "Experience — Priyam Singh" },
      {
        name: "description",
        content:
          "Professional experience of Priyam Singh — Java full-stack roles, responsibilities, and impact across companies.",
      },
      { property: "og:title", content: "Experience — Priyam Singh" },
      {
        property: "og:description",
        content:
          "Professional experience of Priyam Singh — Java full-stack roles, responsibilities, and impact across companies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="p-10 text-muted-foreground">
      Couldn't load experience: {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-muted-foreground">No experience published yet.</div>
  ),
  component: ExperiencePage,
});

function ExperiencePage() {
  const { roles } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <p className="label-mono">Career</p>
        <h1 className="mt-3 text-h2">Experience</h1>
        <p className="mt-4 max-w-2xl text-small leading-relaxed text-muted-foreground">
          Five years building backend systems and full-stack products — from
          high-throughput event pipelines to customer-facing React apps.
        </p>

        <div className="mt-14">
          <Timeline roles={roles} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
