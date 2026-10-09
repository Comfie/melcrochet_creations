"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

type Category = { id: string; name: string; slug: string };

/**
 * Touch-friendly horizontal category rail. `allHref`/`allLabel` let the shop
 * scope "All" to the active collection (e.g. "All Home & Living").
 */
export default function CategoryFilter({
  categories,
  activeSlug,
  allHref = "/products",
  allLabel = "All",
}: {
  categories: Category[];
  activeSlug: string | undefined;
  allHref?: string;
  allLabel?: string;
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
    `shrink-0 whitespace-nowrap border px-4 py-2.5 font-sans text-[0.8125rem] transition-colors duration-300 ${
      isActive
        ? "border-ink bg-ink text-cream"
        : "border-ink/15 text-ink/75 hover:border-ink hover:text-ink"
    }`;

  return (
    <div className="relative">
      <nav
        aria-label="Filter by category"
        className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        <Link
          href={allHref}
          ref={!activeSlug ? activeRef : undefined}
          aria-current={!activeSlug ? "page" : undefined}
          className={pillClass(!activeSlug)}
        >
          {allLabel}
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

      {/* Right-edge fade hinting there's more to scroll (mobile, decorative). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -right-5 w-10 bg-gradient-to-l from-cream to-transparent sm:hidden"
      />
    </div>
  );
}
