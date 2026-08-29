import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminSkeleton } from "@/components/admin/admin-skeleton";
import { checkAdminSession } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  // Session lives in browser storage, so the gate runs after hydration — but
  // the check itself is a server call (see src/lib/admin.server.ts).
  ssr: false,
  beforeLoad: async () => {
    const result = await checkAdminSession();
    if (!result.ok) {
      throw redirect({ to: "/admin/login", replace: true });
    }
    return { admin: result.session };
  },
  component: AdminLayout,
  // While beforeLoad resolves, render only a neutral skeleton — never the
  // sidebar/topbar shell — so a hard refresh exposes no admin structure.
  pendingMs: 0,
  pendingComponent: AdminSkeleton,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-10 text-sm text-red-400">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-10 text-sm">Not found.</div>,
});

function AdminLayout() {
  const { admin } = Route.useRouteContext();
  return (
    <AdminShell email={admin.email}>
      <Outlet />
    </AdminShell>
  );
}
