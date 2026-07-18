import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import FaqPage, { metadata } from "./page";

describe("FaqPage", () => {
  it("has a unique title and description", () => {
    expect(metadata.title).toBe("Delivery, Payment & FAQ");
    expect(metadata.description).toContain("Delivery");
  });

  it("renders the page heading and at least one question", () => {
    const html = renderToStaticMarkup(<FaqPage />);
    expect(html).toContain("Delivery, Payment &amp; FAQ");
    expect(html).toContain("How do I pay?");
  });

  it("emits FAQPage JSON-LD", () => {
    const html = renderToStaticMarkup(<FaqPage />);
    expect(html).toContain("FAQPage");
  });
});
