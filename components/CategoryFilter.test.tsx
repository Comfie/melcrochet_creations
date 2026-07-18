import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import CategoryFilter from "./CategoryFilter";

const categories = [
  { id: "1", name: "Hats", slug: "hats" },
  { id: "2", name: "Bags", slug: "bags" },
];

// Locates the full `<a ...>` opening tag that contains the given href
// attribute. Using a fixed character window around the href (as a naive
// approach might) is unreliable here: React's SSR serializer emits
// `aria-current` *before* `class`, and the generated class string is long
// enough (~90 chars) to push `aria-current` outside a +/-100 char window.
// Extracting the actual tag boundaries is robust to attribute order and
// class-string length.
function getOpeningTag(html: string, hrefAttr: string): string {
  const hrefIndex = html.indexOf(hrefAttr);
  const tagStart = html.lastIndexOf("<a", hrefIndex);
  const tagEnd = html.indexOf(">", hrefIndex) + 1;
  return html.slice(tagStart, tagEnd);
}

describe("CategoryFilter", () => {
  it("renders an 'All' link plus one link per category", () => {
    const html = renderToStaticMarkup(
      <CategoryFilter categories={categories} activeSlug={undefined} />
    );
    expect(html).toContain('href="/products"');
    expect(html).toContain('href="/products?category=hats"');
    expect(html).toContain('href="/products?category=bags"');
  });

  it("marks the active category link with aria-current", () => {
    const html = renderToStaticMarkup(
      <CategoryFilter categories={categories} activeSlug="hats" />
    );
    const hatsTag = getOpeningTag(html, 'href="/products?category=hats"');
    expect(hatsTag).toContain("aria-current");

    const bagsTag = getOpeningTag(html, 'href="/products?category=bags"');
    expect(bagsTag).not.toContain("aria-current");
  });

  it("marks 'All' as active when no category is selected", () => {
    const html = renderToStaticMarkup(
      <CategoryFilter categories={categories} activeSlug={undefined} />
    );
    const allTag = getOpeningTag(html, 'href="/products"');
    expect(allTag).toContain("aria-current");
  });

  it("wraps the pills in a horizontal scroll container", () => {
    const html = renderToStaticMarkup(
      <CategoryFilter categories={categories} activeSlug={undefined} />
    );
    expect(html).toContain("overflow-x-auto");
  });
});
