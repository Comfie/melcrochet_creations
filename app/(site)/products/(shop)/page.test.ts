import "dotenv/config";
import { describe, it, expect } from "vitest";
import { generateMetadata } from "./page";

describe("products index generateMetadata", () => {
  it("uses a generic title/description with no category filter", async () => {
    const metadata = await generateMetadata({ searchParams: Promise.resolve({}) });
    expect(metadata.title).toBe("Shop Handmade Crochet Products in South Africa");
    expect(metadata.alternates).toEqual({ canonical: "/products" });
    expect(metadata.robots).toBeUndefined();
  });

  it("uses keyword-mapped copy and a self-referencing canonical for a known category", async () => {
    const metadata = await generateMetadata({ searchParams: Promise.resolve({ category: "hats" }) });
    expect(metadata.title).toBe("Crochet Hats & Beanies, Handmade in South Africa");
    expect(metadata.alternates).toEqual({ canonical: "/products?category=hats" });
    expect(metadata.robots).toBeUndefined();
  });

  it("uses the collection's SEO copy for a collection view", async () => {
    const metadata = await generateMetadata({ searchParams: Promise.resolve({ collection: "home-living" }) });
    expect(metadata.title).toBe("Crochet Blankets & Baskets for the Home");
    expect(metadata.alternates).toEqual({ canonical: "/products?collection=home-living" });
  });

  it("keeps unknown categories out of the index instead of echoing the slug", async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ category: "does-not-exist-xyz" }),
    });
    expect(metadata.title).not.toContain("does-not-exist-xyz");
    expect(metadata.alternates).toEqual({ canonical: "/products" });
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it("keeps search results out of the index", async () => {
    const metadata = await generateMetadata({ searchParams: Promise.resolve({ q: "blanket" }) });
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});
