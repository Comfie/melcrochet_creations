"use client";

import { createContext, useContext } from "react";

export interface CurrentAdmin {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: "OWNER" | "ADMIN";
}

interface AdminUserContextValue {
  user: CurrentAdmin;
  /** Re-reads /api/auth/me, e.g. after editing the profile. */
  refreshUser: () => Promise<void>;
}

export const AdminUserContext = createContext<AdminUserContextValue | null>(null);

export function useAdminUser(): AdminUserContextValue {
  const ctx = useContext(AdminUserContext);
  if (!ctx) throw new Error("useAdminUser must be used inside the admin shell");
  return ctx;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0]?.[0] ?? "?");
  return letters.toUpperCase();
}

export function Avatar({ name, className = "h-9 w-9 text-xs" }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-gold font-bold text-ink ${className}`}
    >
      {initials(name)}
    </span>
  );
}
