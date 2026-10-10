import prisma from "@/lib/prisma";
import { parseGallery } from "@/lib/product-gallery";

/**
 * Which of the given Cloudinary public IDs are still used by a product
 * (main photo or gallery), testimonial or blog cover. Anything referenced
 * must never be deleted, whatever the browser asks for.
 */
export async function referencedPublicIds(publicIds: string[]): Promise<Set<string>> {
  if (publicIds.length === 0) return new Set();
  const wanted = new Set(publicIds);

  const [mains, galleries, testimonials, posts] = await Promise.all([
    prisma.product.findMany({ where: { imagePublicId: { in: publicIds } }, select: { imagePublicId: true } }),
    // Small catalogue: reading every gallery is simpler than a JSON path query.
    prisma.product.findMany({ select: { gallery: true } }),
    prisma.testimonial.findMany({ where: { imagePublicId: { in: publicIds } }, select: { imagePublicId: true } }),
    prisma.blogPost.findMany({ where: { coverImagePublicId: { in: publicIds } }, select: { coverImagePublicId: true } }),
  ]);

  const used = new Set<string>();
  for (const row of [...mains, ...testimonials]) if (row.imagePublicId) used.add(row.imagePublicId);
  for (const row of posts) if (row.coverImagePublicId) used.add(row.coverImagePublicId);
  for (const row of galleries) {
    for (const img of parseGallery(row.gallery)) if (wanted.has(img.publicId)) used.add(img.publicId);
  }
  return used;
}
