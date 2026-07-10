"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ImagePlaceholder from "@/components/ImagePlaceholder";

type Testimonial = {
  id: string;
  customerName: string;
  quote: string;
  location: string | null;
  imageUrl: string | null;
};

export default function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [index, setIndex] = useState(0);

  if (testimonials.length === 0) {
    return (
      <p className="font-sans text-ink/60">
        Customer stories are on their way — check back soon.
      </p>
    );
  }

  const current = testimonials[index];
  const next = () => setIndex((i) => (i + 1) % testimonials.length);
  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="h-16 w-16 overflow-hidden rounded-full mx-auto">
        {current.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.imageUrl} alt={current.customerName} className="h-full w-full object-cover" />
        ) : (
          <ImagePlaceholder className="h-full w-full" />
        )}
      </div>
      <p className="mt-6 font-display text-xl italic">&ldquo;{current.quote}&rdquo;</p>
      <p className="mt-3 font-sans text-sm font-semibold text-gold">
        {current.customerName}
        {current.location ? ` — ${current.location}` : ""}
      </p>

      {testimonials.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous testimonial"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-taupe/40 hover:border-gold"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next testimonial"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-taupe/40 hover:border-gold"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
