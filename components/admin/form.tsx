"use client";

import type { ReactNode } from "react";

/*
 * Admin form primitives — built for thumbs first. Every control is at least
 * 48px tall and uses 16px text: iOS Safari zooms the whole page into any
 * input whose font-size is under 16px, which is what made the old 14px
 * fields jump around on Melissa's phone.
 */

export const inputClass =
  "block min-h-12 w-full rounded-xl border border-brown/20 bg-white px-4 py-3 text-base text-ink shadow-sm placeholder:text-brown/45 focus:border-ink focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:bg-sand/40";

export const btnPrimary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-cream transition hover:bg-brown disabled:cursor-not-allowed disabled:opacity-50";

export const btnSecondary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-brown/25 bg-white px-5 text-sm font-semibold text-ink transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-50";

export const btnDanger =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50";

export function Field({
  label,
  htmlFor,
  hint,
  required = false,
  children,
}: {
  label: string;
  /** Omit for groups (photos, switches) that label themselves. */
  htmlFor?: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
}) {
  const LabelTag = htmlFor ? "label" : "p";
  return (
    <div>
      <LabelTag {...(htmlFor ? { htmlFor } : {})} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {required && <span className="ml-1 font-normal text-brown/70">(required)</span>}
      </LabelTag>
      {children}
      {hint && <p className="mt-1.5 text-[0.8125rem] leading-snug text-brown/80">{hint}</p>}
    </div>
  );
}

/** A grouped block inside a form, e.g. "Photos", "Price", "Visibility". */
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl bg-white p-4 ring-1 ring-brown/10 sm:p-5">
      <h3 className="label text-gold-deep">{title}</h3>
      {children}
    </section>
  );
}

/** Full-width tappable on/off row. Uses a real checkbox for accessibility. */
export function Switch({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex min-h-12 cursor-pointer items-center justify-between gap-4">
      <span>
        <span className="block text-base font-semibold text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-[0.8125rem] leading-snug text-brown/80">{description}</span>}
      </span>
      <span className="relative inline-flex shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="h-8 w-14 rounded-full bg-brown/20 transition peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-gold peer-focus-visible:ring-offset-2"
        />
        <span
          aria-hidden="true"
          className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow transition peer-checked:translate-x-6 peer-checked:bg-gold"
        />
      </span>
    </label>
  );
}

/** Two-to-four option toggle (e.g. Fixed price / Quote), radio semantics. */
export function Segmented<T extends string>({
  name,
  legend,
  value,
  options,
  onChange,
  hideLegend = false,
}: {
  name: string;
  legend: string;
  hideLegend?: boolean;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className={hideLegend ? "sr-only" : "mb-1.5 block text-sm font-semibold text-ink"}>{legend}</legend>
      <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-sand p-1">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex min-h-11 cursor-pointer items-center justify-center rounded-full px-3 text-sm font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${
              value === opt.value ? "bg-ink text-cream shadow-sm" : "text-brown"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800 ring-1 ring-red-200">
      {message}
    </p>
  );
}
