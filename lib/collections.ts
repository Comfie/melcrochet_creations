/**
 * Customer-facing "collections" — an editorial grouping layered on top of the
 * 12 catalogue categories. Collections are static config (not a DB table):
 * every category belongs to exactly one collection, so nothing in the
 * catalogue becomes undiscoverable. If a new category is added in the admin
 * panel without being mapped here, `collectionForCategory` returns null and
 * the shop still lists it under "All".
 */
export type Collection = {
  slug: string;
  name: string;
  /** Short editorial line shown under the collection name. */
  tagline: string;
  /** Category slugs (see prisma/seed-data.ts) in display order. */
  categorySlugs: readonly string[];
  /**
   * Product slugs to try first for the collection's lead image, so e.g.
   * Crochet Fashion leads with adult pieces rather than whichever photographed
   * product happens to sort first. Falls back to catalogue order.
   */
  leadProductSlugs?: readonly string[];
};

export const COLLECTIONS: readonly Collection[] = [
  {
    slug: "crochet-fashion",
    name: "Crochet Fashion",
    tagline: "Sweaters and hats, handmade to wear with intent.",
    categorySlugs: ["adult-sweaters", "hats"],
    leadProductSlugs: ["adult-sweater", "adult-ruffle-bucket-hat", "adult-beanie-hat"],
  },
  {
    slug: "bags-accessories",
    name: "Bags & Accessories",
    tagline: "Everyday bags and finishing touches, stitched by hand.",
    categorySlugs: ["bags", "scrunchies"],
    leadProductSlugs: ["casual-handbag-with-accessories", "laptop-bag"],
  },
  {
    slug: "baby-kids",
    name: "Baby & Kids",
    tagline: "Soft blankets, sweaters and occasion dresses for little ones.",
    categorySlugs: ["baby-blankets", "baby-sweaters", "kids-sweaters", "kids-dresses"],
  },
  {
    slug: "home-living",
    name: "Home & Living",
    tagline: "Statement throws and sturdy baskets for the spaces you love.",
    categorySlugs: ["throw-blankets", "baskets"],
  },
  {
    slug: "gifts-custom",
    name: "Gifts & Custom Creations",
    tagline: "Curated gift sets and pieces made entirely to your brief.",
    categorySlugs: ["gift-sets", "custom-orders"],
  },
] as const;

export function getCollectionBySlug(slug: string | undefined | null): Collection | null {
  if (!slug) return null;
  return COLLECTIONS.find((c) => c.slug === slug) ?? null;
}

export function collectionForCategory(categorySlug: string | undefined | null): Collection | null {
  if (!categorySlug) return null;
  return COLLECTIONS.find((c) => c.categorySlugs.includes(categorySlug)) ?? null;
}
