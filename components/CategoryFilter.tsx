"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

type Category = { id: string; name: string; slug: string };

export default function CategoryFilter({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug: string | undefined;
}) {
  const activeRef = useRef<HTMLAnchorElement>(null);

  // Bring the active pill into view when landing on a filtered URL.
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "instant" as ScrollBehavior,
    });
  }, [activeSlug]);

  const pillClass = (isActive: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 font-sans text-sm transition-colors ${
      isActive
        ? "border-gold bg-gold text-ink"
        : "border-taupe/40 text-ink/70 hover:border-gold"
    }`;

  return (
    <div className="relative">
      <nav
        aria-label="Filter by category"
        className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Link
          href="/products"
          ref={!activeSlug ? activeRef : undefined}
          aria-current={!activeSlug ? "page" : undefined}
          className={pillClass(!activeSlug)}
        >
          All
        </Link>
        {categories.map((category) => {
          const isActive = category.slug === activeSlug;
          return (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              ref={isActive ? activeRef : undefined}
              aria-current={isActive ? "page" : undefined}
              className={pillClass(isActive)}
            >
              {category.name}
            </Link>
          );
        })}
      </nav>

      {/* Right-edge fade hinting there's more to scroll (decorative). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-cream to-transparent"
      />
    </div>
  );
}
