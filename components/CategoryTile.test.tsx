import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import CategoryTile from "./CategoryTile";

const cloudinary =
  "https://res.cloudinary.com/pk8vhsyp/image/upload/v1/melcrochet/sample.jpg";

describe("CategoryTile", () => {
  it("links to the filtered products page for its category", () => {
    const html = renderToStaticMarkup(
      <CategoryTile name="Hats" slug="hats" blurb={null} imageUrl={cloudinary} />
    );
    expect(html).toContain('href="/products?category=hats"');
  });

  it("renders the category name", () => {
    const html = renderToStaticMarkup(
      <CategoryTile name="Throw Blankets" slug="throw-blankets" blurb={null} imageUrl={cloudinary} />
    );
    expect(html).toContain("Throw Blankets");
  });

  it("renders an image (routed through the card preset) when imageUrl is set", () => {
    const html = renderToStaticMarkup(
      <CategoryTile name="Hats" slug="hats" blurb={null} imageUrl={cloudinary} />
    );
    expect(html).toContain("<img");
    // next/image encodes the source in the srcSet attribute; decoding it
    // recovers the cld card transform. We decode only this attribute
    // (rather than the whole markup) because the blur placeholder's inline
    // style contains a literal, non-percent-encoded "%" (e.g.
    // `background-position:50% 50%`) that makes decodeURIComponent throw
    // "URI malformed" if run over the full HTML string.
    const srcSetMatch = html.match(/srcSet="([^"]+)"/);
    expect(srcSetMatch).not.toBeNull();
    expect(decodeURIComponent(srcSetMatch![1])).toContain(
      "f_auto,q_auto,c_fill,ar_1:1,w_600"
    );
  });

  it("renders a branded fallback (no <img>) when imageUrl is null", () => {
    const html = renderToStaticMarkup(
      <CategoryTile name="Custom Orders" slug="custom-orders" blurb={null} imageUrl={null} />
    );
    expect(html).not.toContain("<img");
    expect(html).toContain("Custom Orders");
  });
});
