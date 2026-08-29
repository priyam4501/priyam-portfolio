import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminPageHeader, Field, SaveBar } from "@/components/admin/form-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getProfile,
  profileSchema,
  profileToForm,
  saveProfile,
  type ProfileValues,
} from "@/lib/admin-content";
import { uploadProjectImage, validateImageFile } from "@/lib/admin-projects";

export const Route = createFileRoute("/admin/profile")({
  component: AdminProfile,
  head: () => ({
    meta: [
      { title: "Profile | Admin" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Edit the site profile and SEO metadata." },
    ],
  }),
});

type Errors = { [K in keyof ProfileValues]?: string | undefined };

function ImageField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function pick(file: File | undefined) {
    if (!file) return;
    const invalid = validateImageFile(file);
    if (invalid) {
      toast.error(invalid);
      return;
    }
    setUploading(true);
    try {
      onChange(await uploadProjectImage(file));
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-4">
        <div className="visual-shell flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border">
          {value ? (
            <img src={value} alt={`${label} preview`} className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:border-accent">
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            {value ? "Replace" : "Upload"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              aria-label={`Upload ${label}`}
              onChange={(e) => void pick(e.target.files?.[0])}
            />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent"
            >
              <X className="size-3" /> Remove
            </button>
          )}
        </div>
      </div>
    </Field>
  );
}

function AdminProfile() {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<ProfileValues | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  const { data: row, isLoading, error } = useQuery({
    queryKey: ["admin", "profile"],
    queryFn: getProfile,
  });

  useEffect(() => {
    if (!isLoading) setValues(profileToForm(row ?? null));
  }, [row, isLoading]);

  const save = useMutation({
    mutationFn: (next: ProfileValues) => saveProfile(row?.id ?? null, next),
    onSuccess: () => {
      toast.success("Profile saved.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function set<K extends keyof ProfileValues>(key: K, value: ProfileValues[K]) {
    setValues((prev) => (prev ? { ...prev, [key]: value } : prev));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function submit() {
    if (!values) return;
    const parsed = profileSchema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ProfileValues;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      toast.error("Fix the highlighted fields.");
      return;
    }
    setErrors({});
    save.mutate(parsed.data);
  }

  return (
    <div className="pb-24">
      <AdminPageHeader title="Profile" description="The singleton row powering the whole site." />

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-400">
          {(error as Error).message}
        </p>
      )}
      {!values && <p className="mt-6 text-sm text-muted-foreground">Loading profile…</p>}

      {values && (
        <div className="mt-6 max-w-3xl space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={errors.fullName}>
              <Input value={values.fullName} onChange={(e) => set("fullName", e.target.value)} />
            </Field>
            <Field label="Title" error={errors.title}>
              <Input value={values.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input value={values.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label="Location" error={errors.location}>
              <Input value={values.location} onChange={(e) => set("location", e.target.value)} />
            </Field>
          </div>

          <Field label="Tagline" error={errors.tagline}>
            <Input value={values.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>

          <Field label="Bio" error={errors.bio}>
            <Textarea rows={7} value={values.bio} onChange={(e) => set("bio", e.target.value)} />
          </Field>

          <ImageField
            label="Avatar"
            value={values.avatarUrl}
            onChange={(url) => set("avatarUrl", url)}
          />

          <div className="rounded-xl border border-border bg-surface/40 p-5">
            <h2 className="font-display text-lg font-semibold">SEO</h2>
            <div className="mt-4 space-y-4">
              <Field label="SEO title" hint="Under 60 characters." error={errors.seoTitle}>
                <Input value={values.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
              </Field>
              <Field
                label="SEO description"
                hint="Under 160 characters."
                error={errors.seoDescription}
              >
                <Textarea
                  rows={3}
                  value={values.seoDescription}
                  onChange={(e) => set("seoDescription", e.target.value)}
                />
              </Field>
              <ImageField
                label="OG image"
                hint="Shown when the site is shared."
                value={values.seoOgImageUrl}
                onChange={(url) => set("seoOgImageUrl", url)}
              />
            </div>
          </div>
        </div>
      )}

      {values && (
        <SaveBar
          status={save.isPending ? "Saving…" : "Profile is a single row — saving overwrites it."}
          saving={save.isPending}
          onCancel={() => setValues(profileToForm(row ?? null))}
          onSave={submit}
          saveLabel="Save profile"
        />
      )}
    </div>
  );
}
