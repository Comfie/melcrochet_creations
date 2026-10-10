"use client";

import { useState } from "react";
import { Check, ChevronRight, Copy, KeyRound, LoaderCircle, MessageCircle, ShieldCheck, Users } from "lucide-react";
import { useApiList } from "@/hooks/use-api-list";
import SlideOver from "@/components/admin/SlideOver";
import Toast from "@/components/admin/Toast";
import { Field, FormError, FormSection, Segmented, Switch, btnPrimary, btnSecondary, inputClass } from "@/components/admin/form";
import { EmptyState, ListSkeleton, LoadError, PageHeader, Pill } from "@/components/admin/ui";
import { Avatar, useAdminUser } from "@/components/admin/AdminUserContext";
import { formatRelativeDate } from "@/lib/relative-date";
import { generateTempPassword, loginDetailsMessage } from "@/lib/temp-password";

interface Member {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: "OWNER" | "ADMIN";
  isActive: boolean;
  lastLoginAt: string | null;
}

interface FormState {
  name: string;
  username: string;
  email: string;
  role: "OWNER" | "ADMIN";
  isActive: boolean;
  /** New/temporary password; empty on edit unless resetting. */
  password: string;
}

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "OWNER", label: "Owner" },
] as const;

const ROLE_HELP = {
  ADMIN: "Can manage products, categories, enquiries, testimonials and the blog.",
  OWNER: "Everything an admin can do, plus adding and removing people here.",
} as const;

/** After creating someone or resetting a password: show the details to pass on. */
function ShareDetails({ details, onDone }: { details: { name: string; username: string; password: string }; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  const message = loginDetailsMessage({ ...details, loginUrl: `${window.location.origin}/admin/login` });

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 ring-1 ring-brown/10">
        <p className="flex items-center gap-2 font-semibold text-ink">
          <Check className="h-5 w-5 text-emerald-700" aria-hidden="true" />
          Send {details.name.split(" ")[0]} these sign-in details
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-brown/80">Username</dt>
            <dd className="select-all font-mono font-semibold text-ink">{details.username}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-brown/80">Temporary password</dt>
            <dd className="select-all font-mono font-semibold text-ink">{details.password}</dd>
          </div>
        </dl>
        <p className="mt-4 text-[0.8125rem] text-brown/80">
          This password is only shown now. They can change it under My profile after signing in.
        </p>
      </div>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-ink hover:bg-[#1fbe5a]"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Send on WhatsApp
      </a>
      <button type="button" onClick={copy} className={`${btnSecondary} w-full`}>
        {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        {copied ? "Copied" : "Copy message"}
      </button>
      <button type="button" onClick={onDone} className={`${btnPrimary} w-full`}>
        Done
      </button>
    </div>
  );
}

export default function TeamPage() {
  const { user: me } = useAdminUser();
  const isOwner = me.role === "OWNER";
  const { data: members, loading, error, refresh } = useApiList<Member>("/api/admins");
  const [saving, setSaving] = useState(false);

  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [initialForm, setInitialForm] = useState<FormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [shared, setShared] = useState<{ name: string; username: string; password: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  if (!isOwner) {
    return (
      <div>
        <PageHeader title="Team" />
        <EmptyState
          icon={<ShieldCheck className="h-6 w-6" aria-hidden="true" />}
          title="Owners only"
          message="Only the site owner can add or remove people. Ask them if you need someone added."
        />
      </div>
    );
  }

  const dirty = panelOpen && !shared && JSON.stringify(form) !== JSON.stringify(initialForm);
  const isSelf = editing?.id === me.id;

  function openAdd() {
    const start: FormState = { name: "", username: "", email: "", role: "ADMIN", isActive: true, password: generateTempPassword() };
    setEditing(null);
    setForm(start);
    setInitialForm(start);
    setFormError(null);
    setShared(null);
    setPanelOpen(true);
  }

  function openEdit(member: Member) {
    const start: FormState = {
      name: member.name,
      username: member.username,
      email: member.email ?? "",
      role: member.role,
      isActive: member.isActive,
      password: "",
    };
    setEditing(member);
    setForm(start);
    setInitialForm(start);
    setFormError(null);
    setShared(null);
    setPanelOpen(true);
  }

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    setFormError(null);
  }

  async function handleSave() {
    if (!form) return;
    if (!form.name.trim()) return setFormError("Enter their name.");
    if (!editing && form.username.trim().length < 3) return setFormError("Choose a username of at least 3 characters.");
    if ((!editing || form.password) && form.password.length < 8) {
      return setFormError("The password needs at least 8 characters.");
    }

    const body = editing
      ? {
          name: form.name,
          email: form.email,
          ...(isSelf ? {} : { role: form.role, isActive: form.isActive }),
          ...(form.password ? { password: form.password } : {}),
        }
      : { name: form.name, username: form.username, email: form.email, role: form.role, password: form.password };

    // Plain fetch rather than useApiMutation: the share card needs the
    // response body (the server normalises the username).
    setSaving(true);
    const res = await fetch(editing ? `/api/admins/${editing.id}` : "/api/admins", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    setSaving(false);
    if (!res) return setFormError("Couldn’t reach the server — check your connection.");
    if (res.status === 401) {
      window.location.href = "/admin/login";
      return;
    }
    const data = (await res.json().catch(() => ({}))) as Member & { error?: string; details?: { message?: string }[] };
    if (!res.ok) return setFormError(data.details?.[0]?.message ?? data.error ?? "Something went wrong");

    refresh();
    if (form.password) {
      setShared({ name: data.name, username: data.username, password: form.password });
    } else {
      setPanelOpen(false);
      setToast({ message: "Changes saved", type: "success" });
    }
  }

  return (
    <div>
      <PageHeader
        title="Team"
        subtitle="People who can sign in and manage the website."
        action={{ label: "Add person", onClick: openAdd }}
      />

      {loading ? (
        <ListSkeleton rows={2} />
      ) : error && members.length === 0 ? (
        <LoadError message={error} onRetry={refresh} />
      ) : members.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" aria-hidden="true" />} title="Just you so far" />
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => openEdit(m)}
                className={`flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left ring-1 ring-brown/10 transition hover:ring-brown/30 ${
                  m.isActive ? "" : "opacity-60"
                }`}
              >
                <Avatar name={m.name} className="h-11 w-11 text-sm" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold text-ink">{m.name}</span>
                    {m.id === me.id && <Pill>You</Pill>}
                  </span>
                  <span className="block truncate text-sm text-brown/80">
                    @{m.username} · {m.lastLoginAt ? `Last signed in ${formatRelativeDate(m.lastLoginAt).toLowerCase()}` : "Hasn’t signed in yet"}
                  </span>
                  <span className="mt-1.5 flex gap-1">
                    {m.role === "OWNER" ? <Pill tone="gold">Owner</Pill> : <Pill tone="neutral">Admin</Pill>}
                    {!m.isActive && <Pill tone="hidden">Deactivated</Pill>}
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-brown/50" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <SlideOver
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={shared ? "Share sign-in details" : editing ? `Edit ${editing.name.split(" ")[0]}` : "Add a person"}
        dirty={dirty}
        footer={
          shared || !form ? undefined : (
            <div className="space-y-3">
              <FormError message={formError} />
              <button type="button" onClick={handleSave} disabled={saving} className={`${btnPrimary} w-full`}>
                {saving && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {editing ? "Save changes" : "Add person"}
              </button>
            </div>
          )
        }
      >
        {shared ? (
          <ShareDetails
            details={shared}
            onDone={() => {
              setPanelOpen(false);
              setShared(null);
            }}
          />
        ) : (
          form && (
            <div className="space-y-4">
              <FormSection title="Details">
                <Field label="Name" htmlFor="member-name" required>
                  <input
                    id="member-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    autoCapitalize="words"
                    className={inputClass}
                  />
                </Field>
                {editing ? (
                  <p className="text-sm text-brown/80">
                    Username: <span className="font-semibold text-ink">@{editing.username}</span>
                    {isSelf ? " (change it on My profile)" : " — they can change it on their profile."}
                  </p>
                ) : (
                  <Field label="Username" htmlFor="member-username" required hint="What they’ll type to sign in, e.g. their first name.">
                    <input
                      id="member-username"
                      type="text"
                      value={form.username}
                      onChange={(e) => update("username", e.target.value)}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className={inputClass}
                    />
                  </Field>
                )}
                <Field label="Email" htmlFor="member-email" hint="Optional.">
                  <input
                    id="member-email"
                    type="email"
                    inputMode="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    autoCapitalize="none"
                    className={inputClass}
                  />
                </Field>
              </FormSection>

              {!isSelf && (
                <FormSection title="Access">
                  <Segmented name="member-role" legend="Role" value={form.role} options={ROLE_OPTIONS} onChange={(v) => update("role", v)} />
                  <p className="text-sm text-brown/80">{ROLE_HELP[form.role]}</p>
                  {editing && (
                    <Switch
                      id="member-active"
                      label="Can sign in"
                      description={form.isActive ? "Active." : "Deactivated — signed out and can’t sign in. Their record is kept."}
                      checked={form.isActive}
                      onChange={(v) => update("isActive", v)}
                    />
                  )}
                </FormSection>
              )}

              <FormSection title={editing ? "Password" : "Temporary password"}>
                {editing && !form.password ? (
                  <button
                    type="button"
                    onClick={() => update("password", generateTempPassword())}
                    className={`${btnSecondary} w-full`}
                    disabled={isSelf}
                  >
                    <KeyRound className="h-4 w-4" aria-hidden="true" />
                    {isSelf ? "Change your own password on My profile" : "Reset their password"}
                  </button>
                ) : (
                  <Field
                    label={editing ? "New temporary password" : "Temporary password"}
                    htmlFor="member-password"
                    hint={
                      editing
                        ? "Saving signs them out everywhere. You’ll get the details to send them."
                        : "We’ve made one up. You’ll get a message to send them after adding."
                    }
                  >
                    <div className="flex gap-2">
                      <input
                        id="member-password"
                        type="text"
                        value={form.password}
                        onChange={(e) => update("password", e.target.value)}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        autoComplete="off"
                        className={`${inputClass} font-mono`}
                      />
                      <button
                        type="button"
                        onClick={() => update("password", generateTempPassword())}
                        className={`${btnSecondary} shrink-0 px-4`}
                      >
                        New
                      </button>
                    </div>
                  </Field>
                )}
              </FormSection>
            </div>
          )
        )}
      </SlideOver>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
