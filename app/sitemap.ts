import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { COLLECTIONS } from "@/lib/collections";
import { cld } from "@/lib/cloudinary-url";
import { getProducts, getPublishedBlogPosts, getCategoriesWithProductCounts } from "@/lib/queries";

export const revalidate = 3600;

/**
 * Only canonical, indexable URLs: every URL here is the exact canonical its
 * page declares (see lib/seo.ts). Empty categories are left out because
 * their pages are noindex until they have products.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Sequential: one Postgres connection at a time (see app/(site)/page.tsx).
  const products = await getProducts();
  const posts = await getPublishedBlogPosts();
  const categories = await getCategoriesWithProductCounts();
  const base = SITE.url;

  const latest = (dates: Date[]) =>
    dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : undefined;
  const catalogueUpdated = latest(products.map((p) => p.updatedAt));
  const updatedIn = (categorySlugs: readonly string[]) =>
    latest(products.filter((p) => categorySlugs.includes(p.category.slug)).map((p) => p.updatedAt));
  const collectionsWithProducts = COLLECTIONS.filter((c) =>
    products.some((p) => c.categorySlugs.includes(p.category.slug))
  );

  return [
    { url: base, lastModified: catalogueUpdated, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/products`, lastModified: catalogueUpdated, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/collections`, lastModified: catalogueUpdated, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/custom-orders`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: latest(posts.map((p) => p.updatedAt)), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.6 },

    ...collectionsWithProducts.map((c) => ({
      url: `${base}/products?collection=${c.slug}`,
      lastModified: updatedIn(c.categorySlugs),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),

    ...categories
      .filter((c) => c._count.products > 0)
      .map((c) => ({
        url: `${base}/products?category=${c.slug}`,
        lastModified: updatedIn([c.slug]),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),

    ...products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      // Transformed URLs: Cloudinary strips camera metadata (EXIF/GPS) from these.
      ...(p.imageUrl ? { images: [cld(p.imageUrl, "detail")] } : {}),
    })),

    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      ...(p.coverImageUrl ? { images: [cld(p.coverImageUrl, "detail")] } : {}),
    })),
  ];
}
