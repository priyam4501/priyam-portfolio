/**
 * Reserved space for the future 3D interactive visualization.
 * Replace this component's contents with the real embed later —
 * the hero layout only depends on this file filling its container.
 */
export function HeroVisual() {
  return (
    <div
      className="visual-shell relative aspect-square w-full overflow-hidden rounded-2xl border border-border lg:aspect-[4/5]"
      aria-hidden="true"
    >
      <div className="visual-grid absolute inset-0" />
      {/* Corner tick marks — measurement-grid feel */}
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
