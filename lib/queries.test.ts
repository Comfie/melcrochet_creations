import "dotenv/config";
import { describe, it, expect } from "vitest";
import {
  getCategories,
  getProducts,
  getProductBySlug,
  getTestimonials,
  getPublishedBlogPosts,
  getBlogPostBySlug,
} from "./queries";

describe("getCategories", () => {
  it("returns all 12 seeded categories, sorted", async () => {
    const categories = await getCategories();
    expect(categories).toHaveLength(12);
    expect(categories[0].name).toBe("Baby Blankets");
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
