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
});
