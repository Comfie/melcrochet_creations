import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductJsonLd, LocalBusinessJsonLd, FaqJsonLd } from "./JsonLd";

function extractJson(html: string): unknown {
  const match = html.match(/<script[^>]*>([\s\S]*)<\/script>/);
  if (!match) throw new Error("no <script> tag found in rendered output");
  return JSON.parse(match[1]);
}

describe("ProductJsonLd", () => {
  it("includes an Offer for a FIXED price product", () => {
    const html = renderToStaticMarkup(
      <ProductJsonLd
        name="Lap Throw Blanket"
        description="A cosy lap throw."
        slug="lap-throw-blanket"
        images={["https://res.cloudinary.com/demo/image/upload/f_auto/v1/a.jpg"]}
        priceType="FIXED"
        price={650}
      />
    );
    const data = extractJson(html) as Record<string, unknown>;
    expect(data["@type"]).toBe("Product");
    expect(data.name).toBe("Lap Throw Blanket");
    const offers = data.offers as Record<string, unknown>;
    expect(offers.price).toBe(650);
    expect(offers.priceCurrency).toBe("ZAR");
  });

  it("omits the Offer for a QUOTE price product", () => {
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
    const data = extractJson(html) as Record<string, unknown>;
    expect(data.offers).toBeUndefined();
  });

  it("escapes dangerous characters in admin-entered product description to prevent XSS", () => {
    const maliciousDescription = 'Nice blanket</script><script>alert(1)</script>';
    const html = renderToStaticMarkup(
      <ProductJsonLd
        name="Product"
        description={maliciousDescription}
        slug="product-slug"
        images={[]}
        priceType="QUOTE"
        price={null}
      />
    );
    // Assert the raw HTML does not contain the literal closing/opening script tags
    expect(html).not.toContain("</script><script>");
    // Assert the JSON-LD is still valid and recovers the original description
    const data = extractJson(html) as Record<string, unknown>;
    expect(data.description).toBe(maliciousDescription);
  });
});

describe("LocalBusinessJsonLd", () => {
  it("renders LocalBusiness with brand contact details", () => {
    const html = renderToStaticMarkup(<LocalBusinessJsonLd />);
    const data = extractJson(html) as Record<string, unknown>;
    expect(data["@type"]).toBe("LocalBusiness");
    expect(data.name).toBe("MelCrochet Gifted Hands");
    expect(data.telephone).toBe("+27670590600");
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
