import { parseGallery } from "@/lib/product-gallery";

/** The fields of a product row (with its category) that the storefront reads. */
export type CatalogueProduct = {
  id: string;
  slug: string;
  name: string;
  priceType: "FIXED" | "QUOTE";
  price: unknown;
  currency: string;
  imageUrl: string | null;
  gallery: unknown;
  leadTime: string | null;
  featured: boolean;
  category: { name: string; slug: string };
};

/** First gallery photo that isn't the main image — used for hover swaps. */
export function secondaryImage(product: Pick<CatalogueProduct, "imageUrl" | "gallery">): string | null {
  const extra = parseGallery(product.gallery).find((img) => img.url !== product.imageUrl);
  return extra?.url ?? null;
}

/** Maps a catalogue row to ProductCard props. */
export function toCardProduct(product: CatalogueProduct) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    priceType: product.priceType,
    price: product.price,
    currency: product.currency,
    imageUrl: product.imageUrl,
    leadTime: product.leadTime,
    hoverImageUrl: product.imageUrl ? secondaryImage(product) : null,
    categoryName: product.category.name,
  };
}

/**
 * Photographed products whose category is in `categorySlugs`, in catalogue
 * order. Input is assumed already sorted by sortOrder (as getProducts is).
 */
export function photographedIn<T extends CatalogueProduct>(
  products: readonly T[],
  categorySlugs: readonly string[]
): T[] {
  return products.filter((p) => p.imageUrl && categorySlugs.includes(p.category.slug));
}

/**
 * Picks up to `count` photographed products, one per category before
 * repeating any category, so image grids show the range of the catalogue.
 */
export function diversePhotographed<T extends CatalogueProduct>(products: readonly T[], count: number): T[] {
  const withImage = products.filter((p) => p.imageUrl);
  const picked: T[] = [];
  const seen = new Set<string>();
  for (const p of withImage) {
    if (picked.length >= count) break;
    if (!seen.has(p.category.slug)) {
      picked.push(p);
      seen.add(p.category.slug);
    }
  }
  for (const p of withImage) {
    if (picked.length >= count) break;
    if (!picked.includes(p)) picked.push(p);
  }
  return picked;
}

/**
 * "Throw Blankets" → "throw blanket", "Kids Dresses" → "kids dress" — for
 * natural phrasing in prefilled WhatsApp messages. Covers the catalogue's
 * category names; not a general-purpose English singulariser.
 */
export function singularPiece(categoryName: string): string {
  const lower = categoryName.trim().toLowerCase();
  if (lower.endsWith("sses")) return lower.slice(0, -2);
  if (lower.endsWith("s") && !lower.endsWith("ss")) return lower.slice(0, -1);
  return lower;
}

/**
 * The photographed product that leads a collection: its preferred products
 * first (in the order given), then the first photographed product in its
 * categories.
 */
export function collectionLead<T extends CatalogueProduct>(
  products: readonly T[],
  collection: { categorySlugs: readonly string[]; leadProductSlugs?: readonly string[] }
): T | null {
  for (const slug of collection.leadProductSlugs ?? []) {
    const match = products.find((p) => p.slug === slug && p.imageUrl);
    if (match) return match;
  }
  return photographedIn(products, collection.categorySlugs)[0] ?? null;
}
