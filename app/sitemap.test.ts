import "dotenv/config";
import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("includes the core static routes", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://melcrochet.co.za");
    expect(urls).toContain("https://melcrochet.co.za/products");
    expect(urls).toContain("https://melcrochet.co.za/faq");
    expect(urls).toContain("https://melcrochet.co.za/collections");
    expect(urls).toContain("https://melcrochet.co.za/custom-orders");
    expect(urls).toContain("https://melcrochet.co.za/privacy");
    expect(urls).toContain("https://melcrochet.co.za/products?collection=home-living");
  });

  it("includes a URL for a known seeded product", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://melcrochet.co.za/products/king-throw-blanket");
  });

  it("includes one products URL per category slug", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://melcrochet.co.za/products?category=hats");
  });

  it("lists every URL once, on the canonical host, without admin, API or search URLs", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) {
      expect(url.startsWith("https://melcrochet.co.za")).toBe(true);
      expect(url).not.toMatch(/\/(admin|api)(\/|$)|[?&]q=|www\.|\/$/);
    }
  });

  it("uses metadata-stripped Cloudinary transforms for image entries", async () => {
    const images = (await sitemap()).flatMap((e) => e.images ?? []);
    for (const image of images) {
      expect(image).toMatch(/\/upload\/f_auto,q_auto,w_1200\//);
    }
  });
});
