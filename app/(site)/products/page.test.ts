import "dotenv/config";
import { describe, it, expect } from "vitest";
import { generateMetadata } from "./page";

describe("products index generateMetadata", () => {
  it("uses a generic title/description with no category filter", async () => {
    const metadata = await generateMetadata({ searchParams: Promise.resolve({}) });
    expect(metadata.title).toBe("Shop Handmade Crochet Products");
    expect(metadata.alternates).toEqual({ canonical: "/products" });
  });

  it("uses a category-specific title when a known category slug is given", async () => {
    const metadata = await generateMetadata({ searchParams: Promise.resolve({ category: "hats" }) });
    expect(metadata.title).toBe("Handmade Hats");
    expect(metadata.alternates).toEqual({ canonical: "/products?category=hats" });
  });

  it("falls back to the raw slug when the category is unknown", async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ category: "does-not-exist-xyz" }),
    });
    expect(metadata.title).toBe("Handmade does-not-exist-xyz");
  });
});
