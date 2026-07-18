import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import BlogCard from "./BlogCard";

const base = {
  id: "1",
  title: "How to care for your crochet blanket",
  slug: "care-guide",
  excerpt: "A short guide.",
  coverImageUrl: null as string | null,
  publishedAt: null as Date | null,
};

describe("BlogCard", () => {
  it("links to the post and renders the title", () => {
    const html = renderToStaticMarkup(<BlogCard post={base} />);
    expect(html).toContain('href="/blog/care-guide"');
    expect(html).toContain("How to care for your crochet blanket");
  });

  it("renders the cover image via next/image (detail preset) when present", () => {
    const html = renderToStaticMarkup(
      <BlogCard
        post={{ ...base, coverImageUrl: "https://res.cloudinary.com/pk8vhsyp/image/upload/v1/melcrochet/cover.jpg" }}
      />
    );
    expect(html).toContain("<img");
    const srcSetMatch = html.match(/srcSet="([^"]+)"/);
    expect(srcSetMatch).not.toBeNull();
    expect(decodeURIComponent(srcSetMatch![1])).toContain("f_auto,q_auto,w_1200");
  });

  it("renders the placeholder (no <img>) when there is no cover image", () => {
    const html = renderToStaticMarkup(<BlogCard post={base} />);
    expect(html).not.toContain("<img");
  });
});
