"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogOut } from "lucide-react";
import { useApiMutation } from "@/hooks/use-api-mutation";
import Toast from "@/components/admin/Toast";
import { Field, FormError, FormSection, btnPrimary, inputClass } from "@/components/admin/form";
import { PageHeader } from "@/components/admin/ui";
import { Avatar, useAdminUser } from "@/components/admin/AdminUserContext";

export default function ProfilePage() {
  const { user, refreshUser } = useAdminUser();
  const router = useRouter();
  const details = useApiMutation();
  const password = useApiMutation();

  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email ?? "");
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const detailsChanged = name !== user.name || username !== user.username || email !== (user.email ?? "");

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setDetailsError("Enter your name.");
    await details.mutate("/api/profile", {
      method: "PATCH",
      body: { name, username, email },
      onSuccess: async () => {
        await refreshUser();
        setToast({ message: "Profile saved", type: "success" });
      },
      onError: setDetailsError,
    });
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) return setPasswordError("Your new password needs at least 8 characters.");
    if (newPassword !== confirmPassword) return setPasswordError("The two new passwords don’t match.");
    await password.mutate("/api/profile/password", {
      method: "POST",
      body: { currentPassword, newPassword },
      onSuccess: () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setToast({ message: "Password changed — other devices are signed out", type: "success" });
      },
      onError: setPasswordError,
    });
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/admin/login");
  }

  return (
    <div className="max-w-xl">
      <PageHeader title="My profile" />

      <div className="mb-5 flex items-center gap-4">
        <Avatar name={user.name} className="h-16 w-16 text-lg" />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-ink">{user.name}</p>
          <p className="text-sm text-brown/80">
            {user.role === "OWNER" ? "Owner — can manage the team" : "Admin"} · @{user.username}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <form onSubmit={saveDetails}>
          <FormSection title="Your details">
            <Field label="Name" htmlFor="profile-name" required>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setDetailsError(null);
                }}
                autoComplete="name"
                autoCapitalize="words"
                className={inputClass}
              />
            </Field>
            <Field label="Username" htmlFor="profile-username" required hint="What you type to sign in.">
              <input
                id="profile-username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setDetailsError(null);
                }}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className={inputClass}
              />
            </Field>
            <Field label="Email" htmlFor="profile-email" hint="Optional.">
              <input
                id="profile-email"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setDetailsError(null);
                }}
                autoComplete="email"
                autoCapitalize="none"
                className={inputClass}
              />
            </Field>
            <FormError message={detailsError} />
            <button type="submit" disabled={!detailsChanged || details.loading} className={`${btnPrimary} w-full sm:w-auto`}>
              {details.loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Save details
            </button>
          </FormSection>
        </form>

        <form onSubmit={changePassword}>
          <FormSection title="Change password">
            {/* Lets password managers attach the new password to this account. */}
            <input type="text" name="username" autoComplete="username" value={user.username} readOnly hidden />
            <Field label="Current password" htmlFor="pw-current" required>
              <input
                id="pw-current"
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setPasswordError(null);
                }}
                autoComplete="current-password"
                className={inputClass}
              />
            </Field>
            <Field label="New password" htmlFor="pw-new" required hint="At least 8 characters. A short phrase is easy to remember.">
              <input
                id="pw-new"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError(null);
                }}
                autoComplete="new-password"
                className={inputClass}
              />
            </Field>
            <Field label="Confirm new password" htmlFor="pw-confirm" required>
              <input
                id="pw-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError(null);
                }}
                autoComplete="new-password"
                className={inputClass}
              />
            </Field>
            <FormError message={passwordError} />
            <button
              type="submit"
              disabled={!currentPassword || !newPassword || password.loading}
              className={`${btnPrimary} w-full sm:w-auto`}
            >
              {password.loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Change password
            </button>
            <p className="text-[0.8125rem] text-brown/80">Changing your password signs you out on every other phone or computer.</p>
          </FormSection>
        </form>

        <p className="px-1 text-sm text-brown/80">
          You stay signed in on this device for 30 days, and every visit to the Studio extends it.
        </p>

        <button
          type="button"
          onClick={logout}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Log out
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
