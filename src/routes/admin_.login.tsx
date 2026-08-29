import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { checkAdminSession } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin_/login")({
  ssr: false,
  component: AdminLogin,
  head: () => ({
    meta: [
      { title: "Admin Sign In | Priyam Singh" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content: "Restricted sign-in for the portfolio content admin.",
      },
    ],
  }),
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setBusy(false);
      setError(signInError.message || "Sign in failed. Check your credentials.");
      return;
    }

    // Server-side confirmation that this account is allowlisted.
    const result = await checkAdminSession();
    if (!result.ok) {
      await supabase.auth.signOut();
      setBusy(false);
      setError(
        result.reason === "not_allowlisted"
          ? "This account is not authorised for the admin area."
          : "Could not establish an admin session. Try again.",
      );
      return;
    }

    navigate({ to: "/admin", replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface/60 p-8 backdrop-blur">
        <p className="label-mono text-accent">Restricted</p>
        <h1 className="mt-2 font-display text-2xl font-semibold">Admin sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Single-admin area. Access is limited to allowlisted accounts.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="admin-email" className="label-mono block text-muted-foreground">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="label-mono block text-muted-foreground">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
