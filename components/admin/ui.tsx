"use client";

import type { ReactNode } from "react";
import { Plus, Search, X, ImageOff } from "lucide-react";
import { cld } from "@/lib/cloudinary-url";
import { btnPrimary } from "@/components/admin/form";

/**
 * Page title row. On phones the primary action becomes a floating "+"
 * button in thumb reach above the bottom tab bar; from md up it's a normal
 * button beside the title.
 */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-[2rem] font-medium leading-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-brown/80">{subtitle}</p>}
        </div>
        {action && (
          // Wrapper owns the display toggle — btnPrimary's inline-flex would
          // otherwise override `hidden` and show this on phones too.
          <div className="hidden shrink-0 md:block">
            <button type="button" onClick={action.onClick} className={btnPrimary}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {action.label}
            </button>
          </div>
        )}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          aria-label={action.label}
          className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 z-30 flex h-14 items-center gap-2 rounded-full bg-gold pl-4 pr-5 text-sm font-bold text-ink shadow-lg shadow-ink/25 transition active:scale-95 md:hidden"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
          {action.label}
        </button>
      )}
    </>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brown/60" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        enterKeyHint="search"
        className="block min-h-12 w-full rounded-full border border-brown/20 bg-white pl-12 pr-12 text-base text-ink placeholder:text-brown/50 focus:border-ink focus:outline-none focus:ring-2 focus:ring-gold/40 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-brown/70 hover:bg-sand"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/** Horizontally scrollable filter pills (single choice). */
export function FilterChips<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string; count?: number }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition ${
              active ? "bg-ink text-cream" : "bg-white text-brown ring-1 ring-brown/15 hover:ring-brown/40"
            }`}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={`text-xs tabular-nums ${active ? "text-gold" : "text-brown/70"}`}>{opt.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Small square Cloudinary thumbnail — fetches a 150px crop, not the 2000px original. */
export function Thumb({
  url,
  alt = "",
  className = "h-16 w-16 rounded-xl",
  round = false,
  fallback,
}: {
  url: string | null | undefined;
  alt?: string;
  className?: string;
  round?: boolean;
  fallback?: ReactNode;
}) {
  const shape = round ? "rounded-full" : "";
  if (!url) {
    return (
      <div className={`flex shrink-0 items-center justify-center bg-sand text-brown/60 ${className} ${shape}`}>
        {fallback ?? <ImageOff className="h-5 w-5" aria-hidden="true" />}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cld(url, "thumb")}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`shrink-0 bg-sand object-cover ${className} ${shape}`}
    />
  );
}

/** Small status pill used on list cards. */
export function Pill({ tone = "neutral", children }: { tone?: "live" | "hidden" | "gold" | "neutral" | "draft"; children: ReactNode }) {
  const tones = {
    live: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    hidden: "bg-sand text-brown ring-brown/15",
    gold: "bg-gold/15 text-gold-deep ring-gold/40",
    draft: "bg-amber-50 text-amber-800 ring-amber-200",
    neutral: "bg-white text-brown ring-brown/15",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ring-1 ring-inset ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-brown/25 bg-white/60 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand text-brown">{icon}</div>
      <p className="mt-4 font-display text-xl text-ink">{title}</p>
      {message && <p className="mt-1 max-w-xs text-sm text-brown/80">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Placeholder rows while the first fetch is in flight. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-brown/10">
          <div className="h-16 w-16 animate-pulse rounded-xl bg-sand" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-sand" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-sand" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-2xl bg-red-50 p-5 text-sm text-red-800 ring-1 ring-red-200">
      <p className="font-semibold">Couldn’t load this page.</p>
      <p className="mt-1">{message}</p>
      <button type="button" onClick={onRetry} className="mt-3 min-h-11 rounded-full bg-white px-5 font-semibold text-red-800 ring-1 ring-red-200">
        Try again
      </button>
    </div>
  );
}
