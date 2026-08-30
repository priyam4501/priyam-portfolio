/**
 * Hero visual: the real 3D scene (hero-scene.tsx), lazy-loaded client-only,
 * with a static fallback for SSR, first paint, mobile/low-end devices,
 * reduced-motion users, and WebGL failures.
 *
 * The 3D scene must NEVER block LCP — this component renders the same
 * static shell immediately, and only swaps in the 3D canvas after mount,
 * once we've confirmed it's worth loading on this device.
 */
import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";

const HeroScene = lazy(() => import("./hero-scene").then((m) => ({ default: m.HeroScene })));

/** Static shell — used for SSR, first paint, and every fallback path. */
function StaticVisual() {
  return (
    <div
      className="visual-shell relative aspect-square w-full overflow-hidden rounded-2xl border border-border lg:aspect-[4/5]"
      aria-hidden="true"
    >
      <div className="visual-grid absolute inset-0" />
      <div className="absolute left-4 top-4 size-3 border-l border-t border-border" />
      <div className="absolute right-4 top-4 size-3 border-r border-t border-border" />
      <div className="absolute bottom-4 left-4 size-3 border-b border-l border-border" />
      <div className="absolute bottom-4 right-4 size-3 border-b border-r border-border" />
      <p className="label-mono absolute bottom-5 left-1/2 -translate-x-1/2 text-[0.65rem]">
        visual_3d // pending
      </p>
    </div>
  );
}

/** Catches WebGL/context-creation failures so a broken 3D scene never blanks the hero. */
type SceneErrorBoundaryProps = { children: ReactNode; fallback: ReactNode };
type SceneErrorBoundaryState = { failed: boolean };

class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  override state: SceneErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { failed: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Hero visual failed:", error, errorInfo);
  }

  override render() {
    if (this.state.failed) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function shouldLoad3D(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  // Skip 3D on narrow/mobile viewports — static visual only, per perf plan.
  if (window.innerWidth < 768) return false;
  // Skip on devices that report very low CPU concurrency (rough low-end signal).
  const cores = (navigator as { hardwareConcurrency?: number }).hardwareConcurrency;
  if (typeof cores === "number" && cores <= 2) return false;
  return true;
}

export function HeroVisual() {
  const [mounted, setMounted] = useState(false);
  const [wantsScene, setWantsScene] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWantsScene(shouldLoad3D());
  }, []);

  // SSR + first client paint: always the static shell. No layout shift when
  // the real scene swaps in, since both fill the same aspect-ratio box.
  if (!mounted || !wantsScene) {
    return (
      <div className="relative aspect-square w-full lg:aspect-[4/5]">
        <StaticVisual />
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border lg:aspect-[4/5]">
      <SceneErrorBoundary fallback={<StaticVisual />}>
        <Suspense fallback={<StaticVisual />}>
          <HeroScene />
        </Suspense>
      </SceneErrorBoundary>
    </div>
  );
}
