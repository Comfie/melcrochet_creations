/**
 * SEO regression checks across every static public page: unique titles,
 * meta descriptions within search-snippet length, and a canonical that
 * matches og:url. Dynamic pages (product, journal, shop filters) are
 * covered by their own generateMetadata tests.
 */
import { describe, it, expect } from "vitest";
import type { Metadata } from "next";
import { metadata as home } from "./page";
import { metadata as about } from "./about/page";
import { metadata as blog } from "./blog/page";
import { metadata as collections } from "./collections/page";
import { metadata as contact } from "./contact/page";
import { metadata as customOrders } from "./custom-orders/page";
import { metadata as faq } from "./faq/page";

const PAGES: [path: string, metadata: Metadata][] = [
  ["/", home],
  ["/about", about],
  ["/blog", blog],
  ["/collections", collections],
  ["/contact", contact],
  ["/custom-orders", customOrders],
  ["/faq", faq],
];

function titleText(title: Metadata["title"]): string {
  if (typeof title === "string") return title;
  if (title && typeof title === "object" && "absolute" in title) return title.absolute;
  throw new Error("page metadata must set its own title");
}

describe.each(PAGES)("%s metadata", (path, metadata) => {
  it("declares a self-referencing canonical", () => {
    expect(metadata.alternates?.canonical).toBe(path);
  });

  it("keeps og:url in step with the canonical and keeps the site-wide Open Graph defaults", () => {
    const og = metadata.openGraph as Record<string, unknown>;
    expect(og.url).toBe(path);
    expect(og.siteName).toBe("MelCrochet Gifted Hands");
    expect(og.locale).toBe("en_ZA");
  });

  it("has a description that fits a search snippet", () => {
    const description = metadata.description ?? "";
    expect(description.length).toBeGreaterThanOrEqual(70);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it("is indexable", () => {
    expect(metadata.robots).toBeUndefined();
  });

  it("has a title that fits a search result once the brand suffix is added", () => {
    const full = typeof metadata.title === "string" ? `${metadata.title} | MelCrochet` : titleText(metadata.title);
    expect(full.length).toBeLessThanOrEqual(65);
  });
});

describe("static page titles and descriptions", () => {
  it("are unique across pages", () => {
    const titles = PAGES.map(([, m]) => titleText(m.title));
    const descriptions = PAGES.map(([, m]) => m.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });
});
