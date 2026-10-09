import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import NotFoundContent from "./NotFoundContent";

describe("NotFoundContent", () => {
  it("offers a way back to the shop and home", () => {
    const html = renderToStaticMarkup(<NotFoundContent />);
    expect(html).toContain("Error 404");
    expect(html).toContain('href="/products"');
    expect(html).toContain('href="/"');
  });
});
