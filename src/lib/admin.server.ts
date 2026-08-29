/**
 * SINGLE SOURCE OF TRUTH FOR ADMIN AUTHORIZATION.
 *
 * Every admin surface (route gate, server functions, future mutations) must go
 * through `getAdminSession` / `requireAdmin` in this file. Do not re-implement
 * session or allowlist checks anywhere else.
 *
 * Two conditions must BOTH hold:
 *   1. the request carries a valid Supabase access token (verified server-side
 *      against Supabase Auth, not decoded locally), and
 *   2. the authenticated user id exists in `public.admin_allowlist`.
 */
import { createClient } from "@supabase/supabase-js";
import { getRequest } from "@tanstack/react-start/server";

import type { Database } from "@/integrations/supabase/types";

export type AdminSession = {
  userId: string;
  email: string;
};

export type AdminSessionResult =
  | { ok: true; session: AdminSession }
  | { ok: false; reason: "unauthenticated" | "not_allowlisted" };

function isOpaqueKey(value: string) {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function serverClient(accessToken: string) {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Supabase server environment is missing.");

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        if (isOpaqueKey(key) && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("Authorization", `Bearer ${accessToken}`);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

function bearerToken(): string | null {
  const request = getRequest();
  const header = request?.headers?.get("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (!token || scheme?.toLowerCase() !== "bearer") return null;
  return token;
}

/** Verifies the caller server-side. Never throws for ordinary auth failures. */
export async function getAdminSession(): Promise<AdminSessionResult> {
  const token = bearerToken();
  if (!token) return { ok: false, reason: "unauthenticated" };

  const db = serverClient(token);

  const { data: userData, error: userError } = await db.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user) return { ok: false, reason: "unauthenticated" };

  const { data: allow, error: allowError } = await db
    .from("admin_allowlist")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (allowError || !allow) return { ok: false, reason: "not_allowlisted" };

  return { ok: true, session: { userId: user.id, email: user.email ?? "" } };
}

/** Same check, but throws — use inside privileged server function handlers. */
export async function requireAdmin(): Promise<AdminSession> {
  const result = await getAdminSession();
  if (!result.ok) {
    throw new Response("Unauthorized", { status: result.ok ? 200 : 401 });
  }
  return result.session;
}
