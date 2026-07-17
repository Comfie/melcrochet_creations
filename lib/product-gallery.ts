export interface ProductGalleryImage {
  url: string;
  publicId: string;
}

/** Safely narrows a Prisma `Json` column value to ProductGalleryImage[]. */
export function parseGallery(value: unknown): ProductGalleryImage[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ProductGalleryImage => {
    if (typeof item !== "object" || item === null) return false;
    const candidate = item as Record<string, unknown>;
    return typeof candidate.url === "string" && typeof candidate.publicId === "string";
  });
}
