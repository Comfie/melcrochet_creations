import { describe, it, expect } from "vitest";
import {
  CATEGORY_SEO,
  DEFAULT_OG_IMAGE,
  categorySeo,
  markdownToPlainText,
  META_DESCRIPTION_MAX,
  pageMetadata,
  productMetaDescription,
  productTitle,
  truncateText,
} from "./seo";
import { CATEGORIES } from "@/prisma/seed-data";
import { COLLECTIONS } from "./collections";
import { slugify } from "./slug";

const kingThrow = {
  name: "King Throw Blanket",
  description: "King Throw Blanket — handmade by MelCrochet with neat stitches and careful finishing.",
  priceType: "FIXED" as const,
  price: 1600,
  currency: "ZAR",
};

describe("pageMetadata", () => {
  it("sets canonical, og:url, site name and locale together", () => {
    const m = pageMetadata({ title: "Custom Crochet Orders", description: "d", path: "/custom-orders" });
    expect(m.title).toBe("Custom Crochet Orders");
    expect(m.alternates).toEqual({ canonical: "/custom-orders" });
    expect(m.openGraph).toMatchObject({
      url: "/custom-orders",
      siteName: "MelCrochet Gifted Hands",
      locale: "en_ZA",
      type: "website",
      title: "Custom Crochet Orders | MelCrochet",
    });
    expect(m.robots).toBeUndefined();
  });

  it("restates the site-wide Open Graph image when a page has none of its own", () => {
    const m = pageMetadata({ title: "t", description: "d", path: "/" });
    expect((m.openGraph as Record<string, unknown>).images).toEqual([DEFAULT_OG_IMAGE]);
    expect((m.twitter as Record<string, unknown>).images).toEqual(["/opengraph-image.png"]);
  });

  it("supports absolute titles, noindex and article metadata", () => {
    const m = pageMetadata({
      title: "Home",
      absoluteTitle: true,
      description: "d",
      path: "/blog/x",
      noindex: true,
      article: { publishedTime: "2026-07-21T14:41:01.409Z" },
    });
    expect(m.title).toEqual({ absolute: "Home" });
    expect(m.robots).toEqual({ index: false, follow: true });
    expect(m.openGraph).toMatchObject({ type: "article", publishedTime: "2026-07-21T14:41:01.409Z" });
  });
});

describe("truncateText", () => {
  it("returns short text unchanged (whitespace collapsed)", () => {
    expect(truncateText("  Soft   and warm. ")).toBe("Soft and warm.");
  });

  it("cuts long text at a word boundary within the limit", () => {
    const long = "word ".repeat(60);
    const out = truncateText(long);
    expect(out.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
    expect(out.endsWith("word…")).toBe(true);
  });
});

describe("markdownToPlainText", () => {
  it("strips headings, links, images and emphasis", () => {
    expect(markdownToPlainText("# Title\n\nSee **this** [blanket](/products/x) ![img](a.jpg)")).toBe(
      "Title See this blanket"
    );
  });
});

describe("productTitle", () => {
  it("adds the craft keyword and price", () => {
    expect(productTitle(kingThrow)).toBe("King Throw Blanket – Handmade Crochet, R1600");
  });

  it("doesn't repeat 'crochet' and handles quote-only pieces", () => {
    expect(
      productTitle({ ...kingThrow, name: "Custom Crochet Order", priceType: "QUOTE", price: null })
    ).toBe("Custom Crochet Order – Handmade, Quote on Request");
  });
});

describe("productMetaDescription", () => {
  it("adds verifiable context to a short description", () => {
    expect(productMetaDescription(kingThrow)).toBe(
      "King Throw Blanket — handmade by MelCrochet with neat stitches and careful finishing. R1600, handmade to order in South Africa. Order via WhatsApp."
    );
  });

  it("never exceeds the snippet length", () => {
    const long = { ...kingThrow, description: "Made with T shirt yarn. ".repeat(20) };
    expect(productMetaDescription(long).length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
  });

  it("omits the price for quote-only pieces", () => {
    const d = productMetaDescription({ ...kingThrow, priceType: "QUOTE", price: null, description: "" });
    expect(d).toBe("King Throw Blanket. Handmade to order in South Africa. Order via WhatsApp.");
  });
});

describe("category and collection SEO copy", () => {
  it("covers every catalogue category with unique, snippet-length copy", () => {
    const slugs = CATEGORIES.map((c) => slugify(c.name));
    expect(Object.keys(CATEGORY_SEO).sort()).toEqual([...slugs].sort());
    const all = [
      ...Object.values(CATEGORY_SEO),
      ...COLLECTIONS.map((c) => c.seo),
      // Static pages share the namespace; a category must not reuse a page's title.
      { title: "Custom Crochet Orders in South Africa", description: "(the /custom-orders crochet page)" },
    ];
    expect(new Set(all.map((c) => c.title)).size).toBe(all.length);
    expect(new Set(all.map((c) => c.description)).size).toBe(all.length);
    for (const copy of all) {
      expect(`${copy.title} | MelCrochet`.length).toBeLessThanOrEqual(65);
      expect(copy.description.length).toBeLessThanOrEqual(160);
      expect(copy.description.toLowerCase()).toContain("crochet");
    }
  });

  it("falls back to a template for a category added later", () => {
    expect(categorySeo({ slug: "cushions", name: "Cushions" }).title).toBe("Handmade Crochet Cushions");
  });
});
