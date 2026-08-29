import { ArrowDown, ArrowUp, Loader2, Trash2, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-4 py-3">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  error,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  error?: string | undefined;
}) {
  return (
    <Field label={label} error={error}>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
      >
        {options.includes(value) ? null : <option value={value}>{value || "—"}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const tag = draft.trim();
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setDraft("");
  }

  return (
    <div className="rounded-md border border-border bg-background p-2">
      <ul className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <li
            key={tag}
            className="flex items-center gap-1 rounded border border-border px-2 py-0.5 font-mono text-[0.7rem]"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="text-muted-foreground hover:text-accent"
            >
              <X className="size-3" />
            </button>
          </li>
        ))}
      </ul>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        aria-label="Add tag"
        placeholder="Type a tag and press Enter"
        className="mt-2 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

export function SaveBar({
  status,
  saving,
  onCancel,
  onSave,
  disabled,
  saveLabel = "Save",
}: {
  status: string;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
  disabled?: boolean;
  saveLabel?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur md:left-60">
      <div className="flex items-center justify-between gap-4 px-6 py-3">
        <span className="label-mono text-xs text-muted-foreground">{status}</span>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave} disabled={saving || disabled}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function OrderControls({
  label,
  order,
  canMoveUp,
  canMoveDown,
  disabled,
  onMove,
}: {
  label: string;
  order: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled?: boolean;
  onMove: (direction: -1 | 1) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="font-mono text-xs text-muted-foreground">{order}</span>
      <button
        type="button"
        aria-label={`Move ${label} up`}
        disabled={!canMoveUp || disabled}
        onClick={() => onMove(-1)}
        className="rounded border border-border p-1 text-muted-foreground transition hover:text-accent disabled:opacity-30"
      >
        <ArrowUp className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label={`Move ${label} down`}
        disabled={!canMoveDown || disabled}
        onClick={() => onMove(1)}
        className="rounded border border-border p-1 text-muted-foreground transition hover:text-accent disabled:opacity-30"
      >
        <ArrowDown className="size-3.5" />
      </button>
    </div>
  );
}

export function DeleteButton({
  label,
  description,
  onConfirm,
  pending,
}: {
  label: string;
  description?: string;
  onConfirm: () => void;
  pending?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" aria-label={`Delete ${label}`} onClick={() => setOpen(true)}>
        <Trash2 className="size-3.5 text-red-400" />
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{label}”?</AlertDialogTitle>
            <AlertDialogDescription>
              {description ?? "This permanently removes the entry. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function AdminTable({
  columns,
  children,
  minWidth = 760,
}: {
  columns: string[];
  children: ReactNode;
  minWidth?: number;
}) {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm" style={{ minWidth }}>
        <thead className="bg-surface/50 text-left">
          <tr className="label-mono text-xs text-muted-foreground">
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-normal">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-muted-foreground">
        {children}
      </td>
    </tr>
  );
}
