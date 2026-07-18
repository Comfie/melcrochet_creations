import "dotenv/config";
import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("includes the core static routes", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://melcrochet-creations.vercel.app");
    expect(urls).toContain("https://melcrochet-creations.vercel.app/products");
    expect(urls).toContain("https://melcrochet-creations.vercel.app/faq");
  });

  it("includes a URL for a known seeded product", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://melcrochet-creations.vercel.app/products/king-throw-blanket");
  });

  it("includes one products URL per category slug", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://melcrochet-creations.vercel.app/products?category=hats");
  });
});
