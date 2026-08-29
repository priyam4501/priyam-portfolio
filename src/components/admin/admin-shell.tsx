import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import {
  Braces,
  Briefcase,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Link2,
  LogOut,
  User,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin", exact: true },
  { label: "Projects", icon: FolderKanban, to: "/admin/projects", exact: false },
  { label: "Experience", icon: Briefcase, to: "/admin/experience", exact: false },
  { label: "Skills", icon: Wrench, to: "/admin/skills", exact: false },
  { label: "Social Links", icon: Link2, to: "/admin/social-links", exact: false },
  { label: "Coding Stats", icon: Braces, to: "/admin/coding-stats", exact: false },
  { label: "Profile", icon: User, to: "/admin/profile", exact: false },
  { label: "Resume", icon: FileText, to: "/admin/resume", exact: false },
] as const;


const navItemClass =
  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition";

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    await router.invalidate();
    navigate({ to: "/admin/login", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      <aside className="border-b border-border bg-surface/40 md:min-h-screen md:w-60 md:border-b-0 md:border-r">
        <div className="px-5 py-5">
          <p className="label-mono text-accent">Admin</p>
          <p className="font-display text-lg font-semibold">Priyam Singh</p>
        </div>
        <nav className="flex flex-wrap gap-1 px-3 pb-4 md:flex-col">
          {NAV.map((item) => {
            const Icon = item.icon;
            const to = "to" in item ? item.to : undefined;
            return to ? (
              <Link
                key={item.label}
                to={to}
                activeOptions={{ exact: "exact" in item ? item.exact : false }}
                className={`${navItemClass} text-muted-foreground hover:bg-surface hover:text-foreground data-[status=active]:bg-surface data-[status=active]:text-accent`}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                title="Coming soon"
                className={`${navItemClass} cursor-not-allowed text-muted-foreground/50`}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </span>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <span className="label-mono text-muted-foreground">{email}</span>
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm transition hover:border-accent hover:text-accent"
          >
            <LogOut className="size-4" aria-hidden />
            Sign Out
          </button>
        </header>
        <main className="px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
