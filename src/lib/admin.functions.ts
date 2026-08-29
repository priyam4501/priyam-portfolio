import { createServerFn } from "@tanstack/react-start";

import { getAdminSession } from "./admin.server";

/**
 * Server-side admin gate used by the /admin route layout.
 * Runs on the server on every entry to an admin route.
 */
export const checkAdminSession = createServerFn({ method: "GET" }).handler(
  async () => getAdminSession(),
);
