"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ExternalLink,
  LogOut,
  MessageSquareQuote,
  Newspaper,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { Avatar, useAdminUser } from "@/components/admin/AdminUserContext";

interface MenuLink {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

function Row({ href, label, description, icon: Icon }: MenuLink) {
  return (
    <li>
      <Link href={href} className="flex min-h-16 items-center gap-4 px-4 py-3 hover:bg-sand/30">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand text-brown">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-ink">{label}</span>
          <span className="block text-sm text-brown/80">{description}</span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-brown/50" aria-hidden="true" />
      </Link>
    </li>
  );
}

/** Phone-only menu behind the "More" tab (desktop shows these in the sidebar). */
export default function MorePage() {
  const { user } = useAdminUser();
  const router = useRouter();

  const content: MenuLink[] = [
    { href: "/admin/categories", label: "Categories", description: "Add, rename and reorder", icon: Tags },
    { href: "/admin/testimonials", label: "Testimonials", description: "Kind words from customers", icon: MessageSquareQuote },
    { href: "/admin/blog", label: "Blog", description: "Posts and drafts", icon: Newspaper },
  ];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/admin/login");
  }

  return (
    <div>
      <PageHeader title="More" />

      <Link
        href="/admin/profile"
        className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-brown/10 hover:ring-brown/30"
      >
        <Avatar name={user.name} className="h-12 w-12 text-sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-ink">{user.name}</span>
          <span className="block text-sm text-brown/80">
            {user.role === "OWNER" ? "Owner" : "Admin"} · My profile & password
          </span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-brown/50" aria-hidden="true" />
      </Link>

      <h2 className="label mb-2 mt-6 text-gold-deep">Website content</h2>
      <ul className="divide-y divide-brown/10 overflow-hidden rounded-2xl bg-white ring-1 ring-brown/10">
        {content.map((link) => (
          <Row key={link.href} {...link} />
        ))}
      </ul>

      {user.role === "OWNER" && (
        <>
          <h2 className="label mb-2 mt-6 text-gold-deep">Settings</h2>
          <ul className="divide-y divide-brown/10 overflow-hidden rounded-2xl bg-white ring-1 ring-brown/10">
            <Row href="/admin/team" label="Team" description="People who can manage the site" icon={Users} />
          </ul>
        </>
      )}

      <div className="mt-6 space-y-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-ink ring-1 ring-brown/20 hover:ring-brown/50"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          View the website
        </a>
        <button
          type="button"
          onClick={logout}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Log out
        </button>
      </div>
    </div>
  );
}
