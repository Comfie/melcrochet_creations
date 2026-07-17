import "dotenv/config";
import { describe, it, expect } from "vitest";
import { generateMetadata } from "./page";

describe("blog post generateMetadata", () => {
  it("returns 'Post not found' for an unknown slug", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "does-not-exist-xyz" }) });
    expect(metadata.title).toBe("Post not found");
  });
});
