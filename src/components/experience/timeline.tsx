import type { Role } from "@/lib/content";

function TimelineItem({ role, isLast }: { role: Role; isLast: boolean }) {
  return (
    <li className="relative pl-8">
      {/* Node */}
      <span
        aria-hidden
        className="absolute left-0 top-1.5 flex size-3 items-center justify-center"
      >
        <span className="size-3 rounded-full border-2 border-accent bg-background" />
      </span>
      {/* Connector line */}
      {!isLast && (
        <span
          aria-hidden
          className="absolute bottom-0 left-[5px] top-5 w-px bg-border"
        />
      )}

      <div className="pb-10">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-h5">{role.title}</h3>
          <span className="label-mono normal-case">
            {role.startDate} — {role.endDate ?? "Present"}
          </span>
        </div>
        <p className="mt-1 text-small text-muted-foreground">
          {role.company} · {role.location}
        </p>

        <ul className="mt-4 space-y-2">
          {role.highlights.map((h, i) => (
            <li
              key={i}
              className="flex gap-3 text-small leading-relaxed text-muted-foreground"
            >
              <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-accent/60" />
              <span>{h}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap gap-2">
          {role.stack.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </li>
  );
}

export function Timeline({ roles }: { roles: Role[] }) {
  return (
    <ol>
      {roles.map((role, i) => (
        <TimelineItem key={role.id} role={role} isLast={i === roles.length - 1} />
      ))}
    </ol>
  );
}
