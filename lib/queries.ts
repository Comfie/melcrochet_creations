import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import type { CatalogueProduct } from "@/lib/catalogue";
import { CATALOGUE_TAG } from "@/lib/revalidate";

export function getCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

/** Categories with the number of active products in each — for SEO decisions (sitemap, noindex). */
export function getCategoriesWithProductCounts() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
}

export function getProducts(options?: {
  categorySlug?: string;
  /** Any-of filter, used for collections (groups of categories). */
  categorySlugs?: readonly string[];
  featured?: boolean;
  /** Case-insensitive match against product name, description or category. */
  search?: string;
}) {
  const search = options?.search?.trim();
  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(options?.categorySlug
        ? { category: { slug: options.categorySlug } }
        : options?.categorySlugs
          ? { category: { slug: { in: [...options.categorySlugs] } } }
          : {}),
      ...(options?.featured !== undefined
        ? { featured: options.featured }
        : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
              { category: { name: { contains: search, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    },
    include: { category: true },
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Cached reads for the shop listing (/products). That page reads
 * searchParams, so it renders on every request and isn't ISR-cached like the
 * rest of the site; caching its data instead saves two Postgres round trips
 * per collection or category view. Cached values are serialised, so rows are
 * reduced to plain fields (a Prisma Decimal price becomes a string, which
 * formatPrice renders the same way). Search results are never cached.
 */
export const getCachedCategories = unstable_cache(
  async () => (await getCategories()).map(({ id, name, slug, blurb }) => ({ id, name, slug, blurb })),
  ["shop-categories"],
  { revalidate: 60, tags: [CATALOGUE_TAG] }
);

/** Active products in any of `categorySlugs` (all active products when null). */
export const getCachedProducts = unstable_cache(
  async (categorySlugs: string[] | null): Promise<CatalogueProduct[]> =>
    (await getProducts(categorySlugs ? { categorySlugs } : undefined)).map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      priceType: p.priceType,
      price: p.price === null ? null : p.price.toString(),
      currency: p.currency,
      imageUrl: p.imageUrl,
      gallery: p.gallery,
      leadTime: p.leadTime,
      featured: p.featured,
      category: { name: p.category.name, slug: p.category.slug },
    })),
  ["shop-products"],
  { revalidate: 60, tags: [CATALOGUE_TAG] }
);

/**
 * "You may also like" — other active pieces from the same category first,
 * then the rest of the same collection, capped at `limit`.
 */
export async function getRelatedProducts(
  product: { id: string; categoryId: string },
  collectionCategorySlugs: readonly string[],
  limit = 4
) {
  const sameCategory = await prisma.product.findMany({
    where: { isActive: true, categoryId: product.categoryId, id: { not: product.id } },
    include: { category: true },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });
  if (sameCategory.length >= limit || collectionCategorySlugs.length === 0) {
    return sameCategory;
  }

  const rest = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { notIn: [product.id, ...sameCategory.map((p) => p.id)] },
      category: { slug: { in: [...collectionCategorySlugs] } },
    },
    include: { category: true },
    orderBy: { sortOrder: "asc" },
    take: limit - sameCategory.length,
  });
  return [...sameCategory, ...rest];
}

export function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: { category: true },
  });
}

export function getTestimonials() {
  return prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export function getPublishedBlogPosts() {
  return prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });
}

export function getBlogPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, published: true },
  });
}

export async function getCategoriesWithImages(): Promise<
  { id: string; name: string; slug: string; blurb: string | null; imageUrl: string | null }[]
> {
  // Sequential, not Promise.all: this app's DATABASE_URL is a direct
  // (non-pooled) Railway connection, and opening several Postgres
  // connections in the same instant during Vercel's single-worker build
  // has triggered the server to close a connection mid-query (P1017).
  // One query in flight at a time avoids that trigger condition.
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  const products = await prisma.product.findMany({
    where: { isActive: true, imageUrl: { not: null } },
    select: { categoryId: true, imageUrl: true, sortOrder: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });

  // First (lowest sortOrder) photographed product image per category.
  const imageByCategory = new Map<string, string>();
  for (const p of products) {
    if (p.imageUrl && !imageByCategory.has(p.categoryId)) {
      imageByCategory.set(p.categoryId, p.imageUrl);
    }
  }

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    blurb: c.blurb,
    imageUrl: imageByCategory.get(c.id) ?? null,
  }));
}
