"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { deleteAccount } from "./actions";

interface SettingsClientProps {
  username: string;
  email: string;
}

function Section({
  title,
  description,
  children,
  danger,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border bg-card p-6",
        danger ? "border-destructive/40" : "border-border"
      )}
    >
      <div className="mb-5">
        <h2
          className={cn(
            "text-base font-semibold",
            danger ? "text-destructive" : "text-foreground"
          )}
        >
          {title}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputCls = cn(
  "w-full rounded-md border border-input bg-background px-3 py-2",
  "text-sm text-foreground placeholder:text-muted-foreground",
  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
  "transition-colors duration-150 disabled:opacity-50"
);

const btnCls = cn(
  "rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
  "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
  "transition-all duration-150 disabled:pointer-events-none disabled:opacity-50"
);

function Feedback({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null;
  return (
    <div
      className={cn(
        "rounded-md border px-3 py-2",
        msg.ok
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-destructive/30 bg-destructive/10 text-destructive"
      )}
    >
      <p className="text-sm">{msg.text}</p>
    </div>
  );
}

// ── Username ────────────────────────────────────────────────────────────────

function UsernameSection({ username }: { username: string }) {
  const [value, setValue] = useState(username);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || trimmed === username) return;
    setLoading(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ username: trimmed, updated_at: new Date().toISOString() })
      .eq("id", (await supabase.auth.getUser()).data.user!.id);
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Username updated." });
    setLoading(false);
  }

  return (
    <Section title="Username" description="Change your display name.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="New username">
          <input
            className={inputCls}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            minLength={2}
            maxLength={32}
            required
          />
        </Field>
        <Feedback msg={msg} />
        <button type="submit" disabled={loading || value.trim() === username} className={btnCls}>
          {loading ? "Saving…" : "Save username"}
        </button>
      </form>
    </Section>
  );
}

// ── Email ────────────────────────────────────────────────────────────────────

function EmailSection({ email }: { email: string }) {
  const [value, setValue] = useState(email);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || trimmed === email) return;
    setLoading(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: trimmed });
    setMsg(
      error
        ? { ok: false, text: error.message }
        : { ok: true, text: "Confirmation sent to your new address. Check your inbox." }
    );
    setLoading(false);
  }

  return (
    <Section title="Email address" description="A confirmation link will be sent to the new address.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="New email">
          <input
            type="email"
            className={inputCls}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </Field>
        <Feedback msg={msg} />
        <button type="submit" disabled={loading || value.trim() === email} className={btnCls}>
          {loading ? "Sending…" : "Update email"}
        </button>
      </form>
    </Section>
  );
}

// ── Password ─────────────────────────────────────────────────────────────────

function PasswordSection() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      setMsg({ ok: false, text: "New passwords do not match." });
      return;
    }
    if (next.length < 8) {
      setMsg({ ok: false, text: "Password must be at least 8 characters." });
      return;
    }
    setLoading(true);
    setMsg(null);
    // Re-authenticate to verify current password, then update
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: current,
    });
    if (signInError) {
      setMsg({ ok: false, text: "Current password is incorrect." });
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: next });
    if (error) {
      setMsg({ ok: false, text: error.message });
    } else {
      setMsg({ ok: true, text: "Password updated successfully." });
      setCurrent("");
      setNext("");
      setConfirm("");
    }
    setLoading(false);
  }

  return (
    <Section title="Password" description="Use a strong password of at least 8 characters.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Current password">
          <input
            type="password"
            className={inputCls}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>
        <Field label="New password">
          <input
            type="password"
            className={inputCls}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>
        <Field label="Confirm new password">
          <input
            type="password"
            className={inputCls}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>
        <Feedback msg={msg} />
        <button type="submit" disabled={loading} className={btnCls}>
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </Section>
  );
}

// ── Delete account ────────────────────────────────────────────────────────────

function DeleteSection() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const CONFIRM_PHRASE = "delete my account";
  const ready = confirmation === CONFIRM_PHRASE;

  function handleDelete() {
    startTransition(async () => {
      await deleteAccount();
      router.push("/auth/login");
    });
  }

  return (
    <Section
      danger
      title="Delete account"
      description="Permanently deletes your account and all of your modpacks. This cannot be undone."
    >
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive",
            "hover:bg-destructive/20 transition-colors"
          )}
        >
          Delete my account
        </button>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive space-y-1">
            <p className="font-semibold">Warning: this is irreversible.</p>
            <p>All your modpacks and their mod lists will be permanently deleted.</p>
          </div>
          <Field label={`Type "${CONFIRM_PHRASE}" to confirm`}>
            <input
              className={inputCls}
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={CONFIRM_PHRASE}
            />
          </Field>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={!ready || isPending}
              className={cn(
                "rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground",
                "hover:bg-destructive/90 transition-colors disabled:pointer-events-none disabled:opacity-50"
              )}
            >
              {isPending ? "Deleting…" : "Permanently delete"}
            </button>
            <button
              onClick={() => { setOpen(false); setConfirmation(""); }}
              className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function SettingsClient({ username, email }: SettingsClientProps) {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account preferences.</p>
      </div>
      <UsernameSection username={username} />
      <EmailSection email={email} />
      <PasswordSection />
      <DeleteSection />
    </div>
  );
}
