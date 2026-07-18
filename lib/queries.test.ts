import "dotenv/config";
import { describe, it, expect } from "vitest";
import prisma from "@/lib/prisma";
import {
  getCategories,
  getCategoryBySlug,
  getProducts,
  getProductBySlug,
  getTestimonials,
  getPublishedBlogPosts,
  getBlogPostBySlug,
  getCategoriesWithImages,
} from "./queries";

describe("getCategories", () => {
  it("returns all 12 seeded categories, sorted", async () => {
    const categories = await getCategories();
    expect(categories).toHaveLength(12);
    expect(categories[0].name).toBe("Baby Blankets");
  });
});

describe("getCategoryBySlug", () => {
  it("finds the Hats category by slug", async () => {
    const category = await getCategoryBySlug("hats");
    expect(category?.name).toBe("Hats");
  });

  it("returns null for an unknown slug", async () => {
    const category = await getCategoryBySlug("does-not-exist-xyz");
    expect(category).toBeNull();
  });
});

describe("getProducts", () => {
  it("returns only active products by default", async () => {
    const products = await getProducts();
    expect(products.length).toBeGreaterThan(0);
    for (const p of products) {
      expect(p.isActive).toBe(true);
    }
  });

  it("filters by category slug", async () => {
    const products = await getProducts({ categorySlug: "hats" });
    expect(products).toHaveLength(3);
    for (const p of products) {
      expect(p.category.slug).toBe("hats");
    }
  });

  it("filters by featured", async () => {
    const featured = await getProducts({ featured: true });
    for (const p of featured) {
      expect(p.featured).toBe(true);
    }
  });
});

describe("getProductBySlug", () => {
  it("finds the King Throw Blanket by slug", async () => {
    const product = await getProductBySlug("king-throw-blanket");
    expect(product?.name).toBe("King Throw Blanket");
    expect(product?.price?.toString()).toBe("1600");
  });

  it("returns null for an unknown slug", async () => {
    const product = await getProductBySlug("does-not-exist-xyz");
    expect(product).toBeNull();
  });
});

describe("getTestimonials", () => {
  it("returns an array (may be empty pre-Plan-06 seed content)", async () => {
    const testimonials = await getTestimonials();
    expect(Array.isArray(testimonials)).toBe(true);
  });
});

describe("blog queries", () => {
  it("getPublishedBlogPosts returns an array", async () => {
    const posts = await getPublishedBlogPosts();
    expect(Array.isArray(posts)).toBe(true);
  });

  it("getBlogPostBySlug returns null for an unknown slug", async () => {
    const post = await getBlogPostBySlug("does-not-exist-xyz");
    expect(post).toBeNull();
  });
});

describe("getCategoriesWithImages", () => {
  it("returns all 12 categories, sorted, each with an imageUrl field", async () => {
    const cats = await getCategoriesWithImages();
    expect(cats).toHaveLength(12);
    expect(cats[0].name).toBe("Baby Blankets");
    for (const c of cats) {
      expect("imageUrl" in c).toBe(true);
    }
  });

  it("gives a category with photographed products the imageUrl of its lowest-sortOrder photographed product", async () => {
    // Compute the expected value directly rather than hardcoding a Cloudinary
    // URL, since product images can be re-uploaded over time in this shared DB.
    const expected = await prisma.product.findFirst({
      where: { category: { slug: "throw-blankets" }, isActive: true, imageUrl: { not: null } },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { imageUrl: true },
    });
    expect(expected?.imageUrl).toEqual(expect.any(String));

    const cats = await getCategoriesWithImages();
    const throws = cats.find((c) => c.slug === "throw-blankets");
    expect(throws?.imageUrl).toBe(expected?.imageUrl);
  });

  it("returns null imageUrl for a category whose only active product has no image", async () => {
    // Custom Orders is seeded with a single QUOTE placeholder product with no image.
    const cats = await getCategoriesWithImages();
    const custom = cats.find((c) => c.slug === "custom-orders");
    expect(custom).toBeDefined();
    expect(custom?.imageUrl).toBeNull();
  });
});
