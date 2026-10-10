import { parseGallery } from "@/lib/product-gallery";

/** Full piece, stitch close-up, piece in use — the brief from the redesign spec. */
export const RECOMMENDED_PHOTOS = 3;

/** Main photo plus gallery photos. */
export function photoCount(product: { imageUrl: string | null; gallery: unknown }): number {
  return (product.imageUrl ? 1 : 0) + parseGallery(product.gallery).length;
}

/**
 * Reads a price typed on a phone keypad. Accepts "450", "R450", "1 250",
 * and South African decimal commas ("450,50"). Returns null if it isn't a
 * positive amount with at most two decimals.
 */
export function parsePriceInput(raw: string): number | null {
  const cleaned = raw.replace(/[\sR]/gi, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return value > 0 ? value : null;
}
