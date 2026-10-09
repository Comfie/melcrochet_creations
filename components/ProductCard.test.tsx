import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ProductCard from "./ProductCard";

const baseProduct = {
  id: "1",
  slug: "lap-throw-blanket",
  name: "Lap Throw Blanket",
  priceType: "FIXED" as const,
  price: 650,
  currency: "ZAR",
  imageUrl: null,
  leadTime: null,
};

describe("ProductCard", () => {
  it("links the card to the product detail page", () => {
    const html = renderToStaticMarkup(<ProductCard product={baseProduct} />);
    expect(html).toContain('href="/products/lap-throw-blanket"');
  });

  it("offers a WhatsApp enquiry prefilled with the product name", () => {
    const html = renderToStaticMarkup(<ProductCard product={baseProduct} />);
    expect(html).toContain("https://wa.me/27670590600?text=");
    expect(html).toContain("Lap%20Throw%20Blanket");
  });

  it("renders a second hover image when provided", () => {
    const html = renderToStaticMarkup(
      <ProductCard
        product={{
          ...baseProduct,
          imageUrl: "https://res.cloudinary.com/pk8vhsyp/image/upload/v1/melcrochet/a.jpg",
          hoverImageUrl: "https://res.cloudinary.com/pk8vhsyp/image/upload/v1/melcrochet/b.jpg",
        }}
      />
    );
    expect(html.match(/<img/g)).toHaveLength(2);
  });

  it("renders the formatted price", () => {
    const html = renderToStaticMarkup(<ProductCard product={baseProduct} />);
    expect(html).toContain("R650");
  });

  it("renders 'Quote on Request' for QUOTE products", () => {
    const html = renderToStaticMarkup(
      <ProductCard product={{ ...baseProduct, priceType: "QUOTE", price: null }} />
    );
    expect(html).toContain("Quote on Request");
  });

  it("shows a made-to-order badge when leadTime is set", () => {
    const html = renderToStaticMarkup(
      <ProductCard product={{ ...baseProduct, leadTime: "4–6 days" }} />
    );
    expect(html).toContain("Made to order · 4–6 days");
  });

  it("omits the badge when leadTime is not set", () => {
    const html = renderToStaticMarkup(<ProductCard product={baseProduct} />);
    expect(html).not.toContain("Made to order");
  });

  it("renders the product image routed through the portrait preset", () => {
    const html = renderToStaticMarkup(
      <ProductCard
        product={{ ...baseProduct, imageUrl: "https://res.cloudinary.com/pk8vhsyp/image/upload/v1/melcrochet/x.jpg" }}
      />
    );
    expect(html).toContain("<img");
    const srcSetMatch = html.match(/srcSet="([^"]+)"/);
    expect(srcSetMatch).not.toBeNull();
    expect(decodeURIComponent(srcSetMatch![1])).toContain("f_auto,q_auto,c_fill,g_auto,ar_3:4,w_900");
  });

  it("carries its own text-ink color instead of inheriting ambient color", () => {
    const html = renderToStaticMarkup(
      <div className="text-cream">
        <ProductCard product={baseProduct} />
      </div>
    );
    const rootMatch = html.match(/<article class="([^"]*)"[^>]*data-product-card/);
    expect(rootMatch).not.toBeNull();
    expect(rootMatch![1]).toContain("text-ink");
  });
});
