"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ExternalLink,
  House,
  Inbox,
  LoaderCircle,
  LogOut,
  MessageSquareQuote,
  Newspaper,
  Package,
  type LucideIcon,
} from "lucide-react";
import Logo from "@/components/Logo";

interface NavItem {
  href: string;
  label: string;
  /** Tab-bar label — five tabs share ~360px on small phones. */
  short: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/admin", label: "Home", short: "Home", icon: House, exact: true },
  { href: "/admin/products", label: "Products", short: "Products", icon: Package },
  { href: "/admin/enquiries", label: "Enquiries", short: "Enquiries", icon: Inbox },
  { href: "/admin/testimonials", label: "Testimonials", short: "Reviews", icon: MessageSquareQuote },
  { href: "/admin/blog", label: "Blog", short: "Blog", icon: Newspaper },
];

interface Enquiry {
  id: string;
  status: string;
}

function Badge({ count, className = "" }: { count: number; className?: string }) {
  if (count === 0) return null;
  return (
    <span
      className={`flex min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[0.6875rem] font-bold leading-5 text-ink ${className}`}
    >
      {count > 99 ? "99+" : count}
      <span className="sr-only"> new</span>
    </span>
  );
}

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [newEnquiryCount, setNewEnquiryCount] = useState(0);
  const isLogin = pathname === "/admin/login";

  const fetchEnquiryCount = useCallback(async () => {
    try {
      const res = await fetch("/api/enquiries");
      if (res.ok) {
        const data = (await res.json()) as Enquiry[];
        setNewEnquiryCount(data.filter((e) => e.status === "NEW").length);
      }
    } catch {
      // silently fail — badge is non-critical
    }
  }, []);

  useEffect(() => {
    if (isLogin) return;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          setAuthed(true);
          fetchEnquiryCount();
        } else {
          router.push("/admin/login");
        }
      } catch {
        router.push("/admin/login");
      }
    }
    checkAuth();
  }, [isLogin, pathname, router, fetchEnquiryCount]);

  // Pages that change enquiry status without navigating broadcast this so
  // the badge stays in sync; returning to the tab (phone app switch) also
  // re-checks for new enquiries.
  useEffect(() => {
    if (isLogin) return;
    function onVisible() {
      if (document.visibilityState === "visible") fetchEnquiryCount();
    }
    window.addEventListener("mc:enquiries-updated", fetchEnquiryCount);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("mc:enquiries-updated", fetchEnquiryCount);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isLogin, fetchEnquiryCount]);

  if (isLogin) {
    return <>{children}</>;
  }

  if (authed === null) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-cream">
        <Logo variant="icon" className="h-14 w-auto" preload />
        <LoaderCircle className="h-5 w-5 animate-spin text-brown" aria-label="Loading" />
      </div>
    );
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/admin/login");
  }

  return (
    <div className="min-h-dvh bg-cream md:flex">
      {/* Desktop / tablet sidebar */}
      <nav aria-label="Admin" className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-ink md:flex">
        <Link href="/admin" className="block px-5 pb-6 pt-7">
          <Logo variant="horizontal" on="dark" className="h-12 w-auto" />
          <span className="label mt-3 block text-taupe">Studio</span>
        </Link>
        <ul className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
                    active ? "bg-white/10 text-gold" : "text-cream/75 hover:bg-white/5 hover:text-cream"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                  {item.href === "/admin/enquiries" && <Badge count={newEnquiryCount} className="ml-auto" />}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="space-y-1 border-t border-white/10 px-3 py-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-cream/75 hover:bg-white/5 hover:text-cream"
          >
            <ExternalLink className="h-5 w-5" aria-hidden="true" />
            View website
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-cream/75 hover:bg-white/5 hover:text-cream"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            Log out
          </button>
        </div>
      </nav>

      {/* Phone top bar */}
      <header className="sticky top-0 z-30 bg-ink pt-[env(safe-area-inset-top)] md:hidden">
        <div className="flex h-14 items-center gap-3 pl-4 pr-1">
          <Link href="/admin" aria-label="Admin home" className="flex items-center gap-2.5">
            <Logo variant="icon" on="dark" className="h-8 w-auto" decorative />
            <span className="label text-cream">Studio</span>
          </Link>
          <div className="ml-auto flex items-center">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View website"
              className="flex h-12 w-12 items-center justify-center rounded-full text-cream/80 hover:text-cream"
            >
              <ExternalLink className="h-5 w-5" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              className="flex h-12 w-12 items-center justify-center rounded-full text-cream/80 hover:text-cream"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main className="min-w-0 flex-1 pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-10">
        <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 md:pt-10 lg:px-10">{children}</div>
      </main>

      {/* Phone bottom tab bar */}
      <nav
        aria-label="Admin"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold transition ${
                    active ? "text-gold" : "text-cream/70"
                  }`}
                >
                  {active && <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-gold" aria-hidden="true" />}
                  <span className="relative">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                    {item.href === "/admin/enquiries" && <Badge count={newEnquiryCount} className="absolute -right-3 -top-1.5" />}
                  </span>
                  {item.short}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
