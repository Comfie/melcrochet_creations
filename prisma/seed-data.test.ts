import { describe, it, expect } from "vitest";
import { CATEGORIES, PRODUCTS } from "./seed-data";
import { slugify } from "../lib/slug";

describe("seed data", () => {
  it("defines exactly 12 categories with unique names", () => {
    expect(CATEGORIES).toHaveLength(12);
    const names = new Set(CATEGORIES.map((c) => c.name));
    expect(names.size).toBe(12);
  });

  it("has 18 fixed-price products", () => {
    const fixed = PRODUCTS.filter((p) => p.priceType === "FIXED");
    expect(fixed).toHaveLength(18);
    for (const p of fixed) {
      expect(p.price).toBeGreaterThan(0);
    }
  });

  it("has quote products with null price and a valid priceType", () => {
    const quote = PRODUCTS.filter((p) => p.priceType === "QUOTE");
    expect(quote.length).toBeGreaterThanOrEqual(3);
    for (const p of quote) {
      expect(p.price).toBeNull();
    }
  });

  it("every product references a real category name", () => {
    const names = new Set(CATEGORIES.map((c) => c.name));
    for (const p of PRODUCTS) {
      expect(names.has(p.category)).toBe(true);
    }
  });

  it("prices the King Throw Blanket at R1600", () => {
    const king = PRODUCTS.find((p) => p.name === "King Throw Blanket");
    expect(king?.price).toBe(1600);
  });
});

describe("slugify", () => {
  it("kebab-cases names", () => {
    expect(slugify("Baby Throw Blanket")).toBe("baby-throw-blanket");
    expect(slugify("Adult Ruffle Bucket Hat")).toBe("adult-ruffle-bucket-hat");
  });
});
