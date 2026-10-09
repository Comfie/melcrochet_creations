"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Testimonial = {
  id: string;
  customerName: string;
  quote: string;
  location: string | null;
  imageUrl: string | null;
  productName?: string | null;
};

/**
 * Real customer words only — rendered exactly as entered in the admin panel.
 * Renders nothing when there are no testimonials, so the page never shows
 * an empty "reviews" shell or invented social proof.
 */
export default function TestimonialsCarousel({
  testimonials,
  tone = "light",
}: {
  testimonials: Testimonial[];
  tone?: "light" | "dark";
}) {
  const [index, setIndex] = useState(0);

  if (testimonials.length === 0) return null;

  const current = testimonials[index];
  const next = () => setIndex((i) => (i + 1) % testimonials.length);
  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  const accent = tone === "dark" ? "text-gold" : "text-gold-deep";
  const muted = tone === "dark" ? "text-cream/70" : "text-ink/70";
  const ring = tone === "dark" ? "border-cream/30 hover:border-cream" : "border-ink/20 hover:border-ink";

  return (
    <div className="mx-auto max-w-4xl text-center">
      <figure key={current.id} aria-live="polite" className="animate-fade">
        <span aria-hidden="true" className={`block font-display text-8xl leading-[0.6] ${accent}`}>
          &ldquo;
        </span>
        <blockquote className="mt-6 font-display text-[clamp(1.75rem,1.2rem+2.2vw,3.25rem)] font-light italic leading-[1.15]">
          {current.quote}
        </blockquote>
        <figcaption className="mt-10 flex flex-col items-center gap-3">
          {current.imageUrl && (
            // Admin-entered URL may be any host, so not routed through next/image.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.imageUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
          )}
          <span className="label">{current.customerName}</span>
          {(current.location || current.productName) && (
            <span className={`font-sans text-sm ${muted}`}>
              {[current.location, current.productName].filter(Boolean).join(" · ")}
            </span>
          )}
        </figcaption>
      </figure>

      {testimonials.length > 1 && (
        <div className="mt-10 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous testimonial"
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${ring}`}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
          <span className={`label tabular-nums ${muted}`}>
            {String(index + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={next}
            aria-label="Next testimonial"
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${ring}`}
          >
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
