import { useNavigate } from "@tanstack/react-router";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DuplicateSlugError,
  PROJECT_CATEGORIES,
  createProject,
  emptyForm,
  projectSchema,
  slugify,
  updateProject,
  uploadProjectImage,
  validateImageFile,
  type ProjectFormValues,
} from "@/lib/admin-projects";

type Errors = { [K in keyof ProjectFormValues]?: string | undefined };

export function ProjectForm({
  projectId,
  initialValues,
}: {
  projectId?: string;
  initialValues?: ProjectFormValues;
}) {
  const navigate = useNavigate();
  const baseline = useMemo(
    () => initialValues ?? emptyForm(),
    [initialValues],
  );
  const [values, setValues] = useState<ProjectFormValues>(baseline);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"cover" | "gallery" | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(projectId));
  const [tagDraft, setTagDraft] = useState("");
  const coverInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(values) !== JSON.stringify(baseline);

  function set<K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function onTitleChange(next: string) {
    setValues((prev) => ({
      ...prev,
      title: next,
      slug: slugTouched ? prev.slug : slugify(next),
    }));
    setErrors((prev) => ({ ...prev, title: undefined, slug: undefined }));
  }

  function addTag() {
    const tag = tagDraft.trim();
    if (!tag) return;
    if (!values.stackTags.includes(tag)) set("stackTags", [...values.stackTags, tag]);
    setTagDraft("");
  }

  async function handleCover(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      toast.error(problem);
      return;
    }
    setUploading("cover");
    try {
      set("coverImageUrl", await uploadProjectImage(file));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(null);
      if (coverInput.current) coverInput.current.value = "";
    }
  }

  async function handleGallery(files: FileList | null) {
    if (!files?.length) return;
    const picked = Array.from(files);
    const problem = picked.map(validateImageFile).find(Boolean);
    if (problem) {
      toast.error(problem);
      return;
    }
    setUploading("gallery");
    try {
      const urls = await Promise.all(picked.map(uploadProjectImage));
      set("galleryUrls", [...values.galleryUrls, ...urls]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(null);
      if (galleryInput.current) galleryInput.current.value = "";
    }
  }

  async function onSave() {
    const parsed = projectSchema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ProjectFormValues;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSaving(true);
    try {
      if (projectId) {
        await updateProject(projectId, parsed.data);
      } else {
        await createProject(parsed.data);
      }
      toast.success(projectId ? "Project updated." : "Project created.");
      navigate({ to: "/admin/projects" });
    } catch (error) {
      if (error instanceof DuplicateSlugError) {
        setErrors((prev) => ({ ...prev, slug: error.message }));
        toast.error(error.message);
      } else {
        toast.error(error instanceof Error ? error.message : "Save failed.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-28">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Field label="Title" error={errors.title}>
            <Input
              value={values.title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Distributed Order Service"
            />
          </Field>

          <Field label="Slug" error={errors.slug} hint="Used in the public URL. Must be unique.">
            <Input
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
              className="font-mono"
              placeholder="distributed-order-service"
            />
          </Field>

          <Field label="Summary" error={errors.summary} hint="One-line impact statement.">
            <Input
              value={values.summary}
              onChange={(e) => set("summary", e.target.value)}
              maxLength={400}
            />
          </Field>

          <Field
            label="Narrative"
            error={errors.narrative}
            hint="Markdown. Use ## Problem / ## Approach / ## Architecture / ## Outcome headings to fill the detail page sections."
          >
            <Textarea
              value={values.narrative}
              onChange={(e) => set("narrative", e.target.value)}
              rows={16}
              className="font-mono text-sm"
            />
          </Field>

          <Field label="Stack tags" error={errors.stackTags}>
            <div className="rounded-md border border-border bg-background p-2">
              <ul className="flex flex-wrap gap-1.5">
                {values.stackTags.map((tag) => (
                  <li
                    key={tag}
                    className="flex items-center gap-1 rounded border border-border px-2 py-0.5 font-mono text-[0.7rem]"
                  >
                    {tag}
                    <button
                      type="button"
                      aria-label={`Remove ${tag}`}
                      onClick={() =>
                        set("stackTags", values.stackTags.filter((t) => t !== tag))
                      }
                      className="text-muted-foreground hover:text-accent"
                    >
                      <X className="size-3" />
                    </button>
                  </li>
                ))}
              </ul>
              <input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                onBlur={addTag}
                placeholder="Type a tag and press Enter"
                aria-label="Add stack tag"
                className="mt-2 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Live URL" error={errors.liveUrl}>
              <Input value={values.liveUrl} onChange={(e) => set("liveUrl", e.target.value)} />
            </Field>
            <Field label="Repo URL" error={errors.repoUrl}>
              <Input value={values.repoUrl} onChange={(e) => set("repoUrl", e.target.value)} />
            </Field>
            <Field label="Case study URL" error={errors.caseStudyUrl}>
              <Input
                value={values.caseStudyUrl}
                onChange={(e) => set("caseStudyUrl", e.target.value)}
              />
            </Field>
          </div>
        </div>

        <aside className="space-y-5">
          <Field label="Category" error={errors.category}>
            <select
              value={values.category}
              onChange={(e) => set("category", e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              {PROJECT_CATEGORIES.some((c) => c.value === values.category) ? null : (
                <option value={values.category}>{values.category}</option>
              )}
              {PROJECT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Timeframe" error={errors.timeframe}>
              <Input
                value={values.timeframe}
                onChange={(e) => set("timeframe", e.target.value)}
                placeholder="2024 — 2025"
              />
            </Field>
            <Field label="Display order" error={errors.displayOrder}>
              <Input
                type="number"
                value={values.displayOrder}
                onChange={(e) => set("displayOrder", Number(e.target.value) || 0)}
              />
            </Field>
          </div>

          <Field label="Role" error={errors.role}>
            <Input value={values.role} onChange={(e) => set("role", e.target.value)} />
          </Field>

          <div className="space-y-3 rounded-lg border border-border bg-surface/40 p-4">
            <ToggleRow
              label="Published"
              checked={values.isPublished}
              onChange={(v) => set("isPublished", v)}
            />
            <ToggleRow
              label="Featured"
              checked={values.isFeatured}
              onChange={(v) => set("isFeatured", v)}
            />
          </div>

          <div className="space-y-2">
            <Label>Cover image</Label>
            {values.coverImageUrl ? (
              <div className="relative overflow-hidden rounded-lg border border-border">
                <img
                  src={values.coverImageUrl}
                  alt="Cover preview"
                  className="h-36 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => set("coverImageUrl", null)}
                  className="absolute right-2 top-2 rounded-md bg-background/80 p-1 text-muted-foreground hover:text-accent"
                  aria-label="Remove cover image"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WebP or GIF. Max 5MB.
              </p>
            )}
            <input
              ref={coverInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleCover(e.target.files)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading !== null}
              onClick={() => coverInput.current?.click()}
            >
              {uploading === "cover" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              {values.coverImageUrl ? "Replace cover" : "Upload cover"}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Gallery</Label>
            {values.galleryUrls.length > 0 && (
              <ul className="grid grid-cols-3 gap-2">
                {values.galleryUrls.map((url) => (
                  <li key={url} className="relative overflow-hidden rounded-md border border-border">
                    <img src={url} alt="Gallery item" className="h-16 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        set("galleryUrls", values.galleryUrls.filter((u) => u !== url))
                      }
                      className="absolute right-1 top-1 rounded bg-background/80 p-0.5 text-muted-foreground hover:text-accent"
                      aria-label="Remove gallery image"
                    >
                      <X className="size-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <input
              ref={galleryInput}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleGallery(e.target.files)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading !== null}
              onClick={() => galleryInput.current?.click()}
            >
              {uploading === "gallery" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              Add images
            </Button>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur md:left-60">
        <div className="flex items-center justify-between gap-4 px-6 py-3">
          <span className="label-mono text-xs text-muted-foreground">
            {saving
              ? "Saving…"
              : dirty
                ? "Unsaved changes"
                : projectId
                  ? "All changes saved"
                  : "New project"}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate({ to: "/admin/projects" })}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={onSave} disabled={saving || uploading !== null}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Save project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  children: React.ReactNode;
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

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}
