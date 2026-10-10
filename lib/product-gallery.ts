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

interface ProductImages {
  imagePublicId: string | null | undefined;
  gallery: ProductGalleryImage[];
}

/**
 * Cloudinary public IDs referenced by a product before an update but by
 * neither its main image nor its gallery afterwards — safe to delete.
 * `next` fields left undefined mean "unchanged" (PATCH semantics). Swapping
 * the main photo with a gallery photo therefore deletes nothing.
 */
export function orphanedImagePublicIds(
  existing: ProductImages,
  next: { imagePublicId?: string; gallery?: ProductGalleryImage[] }
): string[] {
  const before = [existing.imagePublicId, ...existing.gallery.map((img) => img.publicId)];
  const after = new Set([
    next.imagePublicId !== undefined ? next.imagePublicId : existing.imagePublicId,
    ...(next.gallery ?? existing.gallery).map((img) => img.publicId),
  ]);
  return [...new Set(before)].filter((id): id is string => !!id && !after.has(id));
}
