import { revalidatePath, revalidateTag } from "next/cache";

/** Tag on cached storefront reads (lib/queries.ts) — expired by revalidatePublicSite(). */
export const CATALOGUE_TAG = "catalogue";

/**
 * Public pages are ISR-cached (`revalidate = 60`), so without this an admin
 * edit made on a phone can take a minute or two — and a couple of visits —
 * to show on the live site. Call after any successful catalogue/content
 * mutation so the next visit to any public page renders fresh data.
 *
 * Invalidating the root layout covers every page beneath it (home,
 * collections, product pages, blog, sitemap) without having to track which
 * pages show which rows.
 */
export function revalidatePublicSite(): void {
  try {
    revalidatePath("/", "layout");
    // Cached shop-listing data (lib/queries.ts) — expire now, not
    // stale-while-revalidate, so the next visit shows the edit.
    revalidateTag(CATALOGUE_TAG, { expire: 0 });
  } catch {
    // Only throws outside a Next request (e.g. route handlers called
    // directly from tests). A cache miss must never turn a saved change
    // into an error — the 60s ISR window still applies as a fallback.
  }
}
