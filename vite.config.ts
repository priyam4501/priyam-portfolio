// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// The Lovable sandbox forces the Cloudflare preset and needs our custom
// src/server.ts SSR error wrapper. Outside the sandbox (e.g. Vercel) we let
// the Nitro preset provide its own entry so the correct runtime format is used.
const isSandbox =
  process.env["LOVABLE_SANDBOX"] === "1" || !!process.env["DEV_SERVER__PROJECT_PATH"];

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    ...(isSandbox ? { server: { entry: "server" } } : {}),
  },
  // Pin the Nitro preset to Vercel for self-hosted deployments.
  // Lovable-managed builds ignore this override and continue to use the
  // Cloudflare preset, so the preview is unaffected.
  nitro: { preset: "vercel" },
});
