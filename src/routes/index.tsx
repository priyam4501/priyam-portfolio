import { createFileRoute } from "@tanstack/react-router";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { About } from "@/components/home/about";
import { Skills } from "@/components/home/skills";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { ExperiencePreview } from "@/components/home/experience-preview";
import { ContactCta } from "@/components/home/contact-cta";
import { getHomeData } from "@/lib/content.functions";

export const Route = createFileRoute("/")({
  loader: () => getHomeData(),
  head: ({ loaderData }) => {
    const name = loaderData?.profile?.fullName ?? "Portfolio";
    const title = `${name} — ${loaderData?.profile?.title ?? "Developer"}`;
    const description =
      loaderData?.profile?.tagline ??
      "Portfolio of a Java full-stack developer building reliable backend systems and modern web applications.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div role="alert" className="p-10 text-muted-foreground">
      Couldn't load site content: {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-muted-foreground">Nothing here yet.</div>
  ),
  component: Index,
});

function Index() {
  const { profile, featured, skills, roles, socials, resume, projectCount } =
    Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero profile={profile} resume={resume} />
        <About
          profile={profile}
          roles={roles}
          projectCount={projectCount}
          skills={skills}
        />
        <Skills skills={skills} />
        <FeaturedProjects projects={featured} />
        <ExperiencePreview roles={roles} />
        <ContactCta socials={socials} />
      </main>
      <Footer />
    </div>
  );
}
