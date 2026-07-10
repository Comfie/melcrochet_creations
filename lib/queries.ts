import prisma from "@/lib/prisma";

export function getCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
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
