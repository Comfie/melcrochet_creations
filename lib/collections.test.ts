import { describe, it, expect } from "vitest";
import { COLLECTIONS, collectionForCategory, getCollectionBySlug } from "./collections";
import { CATEGORIES } from "@/prisma/seed-data";
import { slugify } from "./slug";

describe("COLLECTIONS", () => {
  it("maps every catalogue category to exactly one collection", () => {
    const mapped = COLLECTIONS.flatMap((c) => c.categorySlugs);
    const categorySlugs = CATEGORIES.map((c) => slugify(c.name));

    expect(new Set(mapped).size).toBe(mapped.length);
    expect([...mapped].sort()).toEqual([...categorySlugs].sort());
  });

  it("has unique collection slugs", () => {
    const slugs = COLLECTIONS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("getCollectionBySlug", () => {
  it("finds a collection by slug", () => {
    expect(getCollectionBySlug("home-living")?.name).toBe("Home & Living");
  });

  it("returns null for unknown or empty slugs", () => {
    expect(getCollectionBySlug("nope")).toBeNull();
    expect(getCollectionBySlug(undefined)).toBeNull();
  });
});

describe("collectionForCategory", () => {
  it("returns the collection a category belongs to", () => {
    expect(collectionForCategory("hats")?.slug).toBe("crochet-fashion");
    expect(collectionForCategory("baskets")?.slug).toBe("home-living");
  });

  it("returns null for an unmapped category", () => {
    expect(collectionForCategory("not-a-category")).toBeNull();
  });
});
