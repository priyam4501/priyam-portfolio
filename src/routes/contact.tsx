import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ContactForm } from "@/components/contact/contact-form";
import { socialIcon } from "@/components/home/contact-cta";
import { getContactData } from "@/lib/content.functions";

export const Route = createFileRoute("/contact")({
  loader: () => getContactData(),
  head: () => ({
    meta: [
      { title: "Contact — Priyam Singh" },
      {
        name: "description",
        content:
          "Get in touch with Priyam Singh — contact form, resume download, and direct links to email, LinkedIn, and GitHub.",
      },
      { property: "og:title", content: "Contact — Priyam Singh" },
      {
        property: "og:description",
        content:
          "Get in touch with Priyam Singh — contact form, resume download, and direct links to email, LinkedIn, and GitHub.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="p-10 text-muted-foreground">
      Couldn't load contact details: {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-muted-foreground">Nothing here.</div>
  ),
  component: ContactPage,
});

function displayValue(url: string) {
  return url.replace(/^mailto:/, "").replace(/^https?:\/\//, "");
}

function ContactPage() {
  const { socials, resume } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <p className="label-mono">Say hello</p>
        <h1 className="mt-3 text-h2">Contact</h1>
        <p className="mt-4 max-w-2xl text-small leading-relaxed text-muted-foreground">
          Open to full-time Java full-stack roles and interesting contract work.
          The fastest way to reach me is the form below or a direct email.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          {/* Sidebar: resume card + direct links */}
          <div className="space-y-6 lg:col-span-2">
            {resume && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md border border-border bg-surface">
                    <FileText className="size-5 text-accent" />
                  </span>
                  <div>
                    <h3 className="text-h6">Resume</h3>
                    <p className="text-small text-muted-foreground">
                      {[resume.fileSizeLabel, resume.versionLabel]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
                <a
                  href={resume.fileUrl}
                  download
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-small font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Download className="size-4" />
                  Download Resume
                </a>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-h6">Direct</h3>
              <ul className="mt-4 space-y-3">
                {socials.map(({ platform, url }) => {
                  const Icon = socialIcon(platform);
                  const external = !url.startsWith("mailto:");
                  return (
                    <li key={platform}>
                      <a
                        href={url}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                        className="group flex items-center gap-3 rounded-md border border-transparent px-2 py-2 -mx-2 transition-colors hover:border-border hover:bg-surface"
                      >
                        <Icon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
                        <span className="min-w-0">
                          <span className="label-mono block normal-case">
                            {platform}
                          </span>
                          <span className="block truncate text-small text-foreground">
                            {displayValue(url)}
                          </span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
