import prisma from "@/lib/prisma";

export function getCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export function getProducts(options?: {
  categorySlug?: string;
  featured?: boolean;
}) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(options?.categorySlug
        ? { category: { slug: options.categorySlug } }
        : {}),
      ...(options?.featured !== undefined
        ? { featured: options.featured }
        : {}),
    },
    include: { category: true },
    orderBy: { sortOrder: "asc" },
  });
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
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { isActive: true, imageUrl: { not: null } },
      select: { categoryId: true, imageUrl: true, sortOrder: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

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
