import { useState } from "react";
import { Send } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("submitting");
    setErrorMessage(null);

    const { error } = await supabase.from("contact_messages").insert({
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
      return;
    }

    form.reset();
    setStatus("success");
  };

  const inputCls =
    "w-full rounded-md border border-border bg-surface px-3 py-2.5 text-small text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40";

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-h5">Send a message</h3>
      <p className="mt-1 text-small text-muted-foreground">
        I usually reply within one business day.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="label-mono mb-2 block normal-case">
            Name
          </label>
          <input id="contact-name" name="name" required placeholder="Jane Doe" className={inputCls} />
        </div>
        <div>
          <label htmlFor="contact-email" className="label-mono mb-2 block normal-case">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="jane@company.com"
            className={inputCls}
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="contact-message" className="label-mono mb-2 block normal-case">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          placeholder="Tell me about the role or project…"
          className={`${inputCls} resize-y`}
        />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-small font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Send className="size-4" />
          {status === "submitting" ? "Sending…" : "Send Message"}
        </button>

        {status === "success" && (
          <p role="status" className="text-small text-accent">
            Message sent — thanks! I'll get back to you soon.
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="text-small text-destructive">
            {errorMessage ?? "Something went wrong."} Please try again or email me
            directly.
          </p>
        )}
      </div>
    </form>
  );
}
