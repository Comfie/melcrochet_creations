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

  it("renders the product image routed through the card preset", () => {
    const html = renderToStaticMarkup(
      <ProductCard
        product={{ ...baseProduct, imageUrl: "https://res.cloudinary.com/pk8vhsyp/image/upload/v1/melcrochet/x.jpg" }}
      />
    );
    expect(html).toContain("<img");
    const srcSetMatch = html.match(/srcSet="([^"]+)"/);
    expect(srcSetMatch).not.toBeNull();
    expect(decodeURIComponent(srcSetMatch![1])).toContain("f_auto,q_auto,c_fill,ar_1:1,w_600");
  });

  it("carries its own text-ink color instead of inheriting ambient color", () => {
    const html = renderToStaticMarkup(
      <div className="text-cream">
        <ProductCard product={baseProduct} />
      </div>
    );
    const rootMatch = html.match(/<div class="([^"]*border-taupe\/30[^"]*)"/);
    expect(rootMatch).not.toBeNull();
    expect(rootMatch![1]).toContain("text-ink");
  });
});
