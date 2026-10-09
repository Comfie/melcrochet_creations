import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  BlogPostingJsonLd,
  BreadcrumbJsonLd,
  FaqJsonLd,
  OrganizationJsonLd,
  ProductJsonLd,
  WebSiteJsonLd,
} from "./JsonLd";

function extractJson(html: string): Record<string, unknown> {
  const match = html.match(/<script[^>]*>([\s\S]*)<\/script>/);
  if (!match) throw new Error("no <script> tag found in rendered output");
  return JSON.parse(match[1]) as Record<string, unknown>;
}

describe("ProductJsonLd", () => {
  it("includes a made-to-order ZAR Offer for a FIXED price product", () => {
    const html = renderToStaticMarkup(
      <ProductJsonLd
        name="Lap Throw Blanket"
        description="A cosy lap throw."
        slug="lap-throw-blanket"
        images={["https://res.cloudinary.com/demo/image/upload/f_auto/v1/a.jpg"]}
        priceType="FIXED"
        price={650}
        categoryName="Throw Blankets"
      />
    );
    const data = extractJson(html);
    expect(data["@type"]).toBe("Product");
    expect(data.name).toBe("Lap Throw Blanket");
    expect(data.category).toBe("Throw Blankets");
    expect(data.url).toBe("https://melcrochet.co.za/products/lap-throw-blanket");
    const offers = data.offers as Record<string, unknown>;
    expect(offers.price).toBe(650);
    expect(offers.priceCurrency).toBe("ZAR");
    expect(offers.availability).toBe("https://schema.org/MadeToOrder");
    expect(offers.itemCondition).toBe("https://schema.org/NewCondition");
  });

  it("never invents ratings, reviews or SKUs", () => {
    const data = extractJson(
      renderToStaticMarkup(
        <ProductJsonLd name="Scrunchie" description="d" slug="scrunchie" images={[]} priceType="FIXED" price={50} />
      )
    );
    expect(data).not.toHaveProperty("aggregateRating");
    expect(data).not.toHaveProperty("review");
    expect(data).not.toHaveProperty("sku");
    expect(data).not.toHaveProperty("image");
  });

  it("renders nothing for a QUOTE price product (Product markup needs an offer)", () => {
    const html = renderToStaticMarkup(
      <ProductJsonLd
        name="Custom Gift Set"
        description="Made to order."
        slug="custom-gift-set"
        images={[]}
        priceType="QUOTE"
        price={null}
      />
    );
    expect(html).toBe("");
  });

  it("escapes dangerous characters in admin-entered product description to prevent XSS", () => {
    const maliciousDescription = 'Nice blanket</script><script>alert(1)</script>';
    const html = renderToStaticMarkup(
      <ProductJsonLd
        name="Product"
        description={maliciousDescription}
        slug="product-slug"
        images={[]}
        priceType="FIXED"
        price={100}
      />
    );
    // Assert the raw HTML does not contain the literal closing/opening script tags
    expect(html).not.toContain("</script><script>");
    // Assert the JSON-LD is still valid and recovers the original description
    expect(extractJson(html).description).toBe(maliciousDescription);
  });
});

describe("OrganizationJsonLd", () => {
  it("describes the brand without a street address", () => {
    const data = extractJson(renderToStaticMarkup(<OrganizationJsonLd />));
    expect(data["@type"]).toBe("Organization");
    expect(data.name).toBe("MelCrochet Gifted Hands");
    expect(data.telephone).toBe("+27670590600");
    expect((data.logo as Record<string, unknown>).url).toBe("https://melcrochet.co.za/apple-icon.png");
    const address = data.address as Record<string, unknown>;
    expect(address.addressCountry).toBe("ZA");
    expect(address).not.toHaveProperty("streetAddress");
  });
});

describe("WebSiteJsonLd", () => {
  it("names the site and points at the organization", () => {
    const data = extractJson(renderToStaticMarkup(<WebSiteJsonLd />));
    expect(data["@type"]).toBe("WebSite");
    expect(data.name).toBe("MelCrochet Gifted Hands");
    expect(data.url).toBe("https://melcrochet.co.za");
  });
});

describe("BreadcrumbJsonLd", () => {
  it("numbers items and resolves absolute URLs", () => {
    const data = extractJson(
      renderToStaticMarkup(
        <BreadcrumbJsonLd
          items={[
            { name: "Home", path: "/" },
            { name: "Shop", path: "/products" },
            { name: "Hats", path: "/products?category=hats" },
          ]}
        />
      )
    );
    expect(data["@type"]).toBe("BreadcrumbList");
    const items = data.itemListElement as Record<string, unknown>[];
    expect(items.map((i) => i.position)).toEqual([1, 2, 3]);
    expect(items[0].item).toBe("https://melcrochet.co.za");
    expect(items[2].item).toBe("https://melcrochet.co.za/products?category=hats");
  });

  it("renders nothing for an empty trail", () => {
    expect(renderToStaticMarkup(<BreadcrumbJsonLd items={[]} />)).toBe("");
  });
});

describe("BlogPostingJsonLd", () => {
  it("includes headline, dates, image and publisher", () => {
    const data = extractJson(
      renderToStaticMarkup(
        <BlogPostingJsonLd
          title="How I created a luxury chunky throw"
          description="Behind the scenes."
          slug="luxury-chunky-throw"
          image="https://res.cloudinary.com/demo/image/upload/f_auto/v1/a.jpg"
          datePublished={new Date("2026-07-21T14:41:01.409Z")}
          dateModified={new Date("2026-07-22T10:00:00.000Z")}
        />
      )
    );
    expect(data["@type"]).toBe("BlogPosting");
    expect(data.headline).toBe("How I created a luxury chunky throw");
    expect(data.datePublished).toBe("2026-07-21T14:41:01.409Z");
    expect(data.dateModified).toBe("2026-07-22T10:00:00.000Z");
    expect(data.image).toEqual(["https://res.cloudinary.com/demo/image/upload/f_auto/v1/a.jpg"]);
    expect((data.publisher as Record<string, unknown>).name).toBe("MelCrochet Gifted Hands");
  });
});

describe("FaqJsonLd", () => {
  it("renders one Question entity per FAQ item", () => {
    const html = renderToStaticMarkup(
      <FaqJsonLd
        items={[
          { question: "How long does delivery take?", answer: "3-5 business days." },
          { question: "Do you accept returns?", answer: "Only for defects." },
        ]}
      />
    );
    const data = extractJson(html) as { mainEntity: { name: string }[] };
    expect(data.mainEntity).toHaveLength(2);
    expect(data.mainEntity[0].name).toBe("How long does delivery take?");
  });
});
