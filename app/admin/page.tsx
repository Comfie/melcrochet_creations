"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Camera,
  ChevronRight,
  ExternalLink,
  Inbox,
  MessageSquareQuote,
  Newspaper,
  Package,
  Smartphone,
  X,
} from "lucide-react";
import { useApiList } from "@/hooks/use-api-list";
import { Thumb } from "@/components/admin/ui";
import { photoCount, RECOMMENDED_PHOTOS } from "@/lib/admin-products";
import { formatRelativeDate } from "@/lib/relative-date";

interface Product {
  id: string;
  name: string;
  imageUrl: string | null;
  gallery: unknown;
  isActive: boolean;
  featured: boolean;
}

interface Enquiry {
  id: string;
  name: string;
  message: string;
  status: "NEW" | "READ" | "ARCHIVED";
  createdAt: string;
}

interface BlogPost {
  id: string;
  published: boolean;
}

const INSTALL_TIP_KEY = "mc-admin-install-tip-dismissed";

function greeting(now = new Date()) {
  const hour = Number(now.toLocaleString("en-ZA", { hour: "numeric", hour12: false, timeZone: "Africa/Johannesburg" }));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function StatTile({
  href,
  label,
  value,
  icon,
  highlight = false,
}: {
  href: string;
  label: string;
  value: number | null;
  icon: ReactNode;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col justify-between gap-3 rounded-2xl p-4 ring-1 transition active:scale-[0.98] ${
        highlight ? "bg-ink text-cream ring-ink" : "bg-white text-ink ring-brown/10 hover:ring-brown/30"
      }`}
    >
      <span className={`flex items-center gap-2 text-sm font-semibold ${highlight ? "text-gold" : "text-brown"}`}>
        {icon}
        {label}
      </span>
      <span className="text-[2rem] font-bold leading-none tabular-nums">{value ?? "–"}</span>
    </Link>
  );
}

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-medium text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function AdminHomePage() {
  const { data: products, loading: loadingProducts } = useApiList<Product>("/api/products");
  const { data: enquiries, loading: loadingEnquiries } = useApiList<Enquiry>("/api/enquiries");
  const { data: posts, loading: loadingPosts } = useApiList<BlogPost>("/api/blog");
  const [showInstallTip, setShowInstallTip] = useState(false);

  // Suggest "Add to Home Screen" once, unless already running as an app.
  useEffect(() => {
    try {
      const standalone =
        window.matchMedia?.("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowInstallTip(!standalone && localStorage.getItem(INSTALL_TIP_KEY) !== "1");
    } catch {
      // Storage blocked (private mode) — just don't show the tip.
    }
  }, []);

  function dismissInstallTip() {
    setShowInstallTip(false);
    try {
      localStorage.setItem(INSTALL_TIP_KEY, "1");
    } catch {
      // ignore
    }
  }

  const live = products.filter((p) => p.isActive);
  const needPhotos = live.filter((p) => photoCount(p) < RECOMMENDED_PHOTOS);
  const hidden = products.length - live.length;
  const newEnquiries = enquiries.filter((e) => e.status === "NEW");
  const latestEnquiries = enquiries.filter((e) => e.status !== "ARCHIVED").slice(0, 3);
  const drafts = posts.filter((p) => !p.published).length;

  return (
    <div>
      <p className="label text-gold-deep">MelCrochet Studio</p>
      <h1 className="mt-1 font-display text-[2.25rem] font-medium leading-tight text-ink">{greeting()}, Melissa</h1>

      <Link
        href="/admin/products?new=1"
        className="mt-6 flex items-center gap-4 rounded-3xl bg-gold p-5 text-ink shadow-lg shadow-gold/20 transition active:scale-[0.99]"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-gold">
          <Camera className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-bold">Add a new product</span>
          <span className="block text-sm text-ink/80">Snap a photo, add a name and price — done.</span>
        </span>
        <ChevronRight className="h-6 w-6 shrink-0" aria-hidden="true" />
      </Link>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link
          href="/admin/blog?new=1"
          className="flex min-h-14 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-ink ring-1 ring-brown/10 hover:ring-brown/30"
        >
          <Newspaper className="h-5 w-5 text-brown" aria-hidden="true" />
          New blog post
        </Link>
        <Link
          href="/admin/testimonials?new=1"
          className="flex min-h-14 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-ink ring-1 ring-brown/10 hover:ring-brown/30"
        >
          <MessageSquareQuote className="h-5 w-5 text-brown" aria-hidden="true" />
          Add testimonial
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          href="/admin/enquiries"
          label="Unread enquiries"
          value={loadingEnquiries ? null : newEnquiries.length}
          icon={<Inbox className="h-4 w-4" aria-hidden="true" />}
          highlight={newEnquiries.length > 0}
        />
        <StatTile
          href="/admin/products"
          label="Live products"
          value={loadingProducts ? null : live.length}
          icon={<Package className="h-4 w-4" aria-hidden="true" />}
        />
        <StatTile
          href="/admin/products"
          label="Hidden drafts"
          value={loadingProducts ? null : hidden}
          icon={<Package className="h-4 w-4" aria-hidden="true" />}
        />
        <StatTile
          href="/admin/blog"
          label="Blog drafts"
          value={loadingPosts ? null : drafts}
          icon={<Newspaper className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      {showInstallTip && (
        <div className="relative mt-6 flex gap-3 rounded-2xl bg-sand p-4 pr-12 text-sm text-brown">
          <Smartphone className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>
            <strong className="text-ink">Tip: put the Studio on your home screen.</strong> On iPhone, tap Share → “Add to
            Home Screen”. On Android, tap ⋮ → “Add to Home screen”. It then opens like an app.
          </p>
          <button
            type="button"
            onClick={dismissInstallTip}
            aria-label="Dismiss tip"
            className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/60"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {latestEnquiries.length > 0 && (
        <Section
          title="Latest enquiries"
          action={
            <Link href="/admin/enquiries" className="min-h-11 text-sm font-semibold text-gold-deep underline-offset-4 hover:underline">
              View all
            </Link>
          }
        >
          <ul className="divide-y divide-brown/10 overflow-hidden rounded-2xl bg-white ring-1 ring-brown/10">
            {latestEnquiries.map((e) => (
              <li key={e.id}>
                <Link href="/admin/enquiries" className="flex items-start gap-3 p-4 hover:bg-sand/30">
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${e.status === "NEW" ? "bg-gold" : "bg-transparent"}`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className={`truncate text-ink ${e.status === "NEW" ? "font-bold" : "font-semibold"}`}>{e.name}</span>
                      <span className="shrink-0 text-xs text-brown/80">{formatRelativeDate(e.createdAt)}</span>
                    </span>
                    <span className="mt-0.5 line-clamp-1 text-sm text-brown/80">{e.message}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {needPhotos.length > 0 && (
        <Section title="Could use more photos">
          <p className="-mt-1 mb-3 text-sm text-brown/80">
            Live pieces with fewer than {RECOMMENDED_PHOTOS} photos. Close-ups and in-use shots help customers order.
          </p>
          <ul className="divide-y divide-brown/10 overflow-hidden rounded-2xl bg-white ring-1 ring-brown/10">
            {needPhotos.slice(0, 5).map((p) => (
              <li key={p.id}>
                <Link href={`/admin/products?edit=${p.id}`} className="flex items-center gap-3 p-3 hover:bg-sand/30">
                  <Thumb url={p.imageUrl} className="h-14 w-12 rounded-lg" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">{p.name}</span>
                    <span className="text-sm text-brown/80">
                      {photoCount(p)} of {RECOMMENDED_PHOTOS} photos
                    </span>
                  </span>
                  <span className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full bg-sand px-3 text-xs font-bold text-ink">
                    <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                    Add
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 flex min-h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold text-brown ring-1 ring-brown/20 hover:ring-brown/50"
      >
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
        View the website
      </a>
    </div>
  );
}
