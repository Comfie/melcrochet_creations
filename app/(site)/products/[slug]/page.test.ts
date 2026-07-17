import "dotenv/config";
import { describe, it, expect } from "vitest";
import { generateMetadata } from "./page";

describe("product detail generateMetadata", () => {
  it("builds a unique title with the formatted price for a FIXED product", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "king-throw-blanket" }),
    });
    expect(metadata.title).toBe("King Throw Blanket – R1600");
    expect(metadata.alternates).toEqual({ canonical: "/products/king-throw-blanket" });
  });

  it("returns a not-found title for an unknown slug", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "does-not-exist-xyz" }),
    });
    expect(metadata.title).toBe("Product not found");
  });

  it("keeps the meta description within the ~155-character limit", async () => {
    // The seeded description is short and won't actually trigger truncation
    // (seed.ts: "{name} — handmade by MelCrochet with neat stitches and
    // careful finishing."), but the invariant — never exceed 155 chars —
    // must hold regardless of description length.
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "king-throw-blanket" }),
    });
    expect((metadata.description as string).length).toBeLessThanOrEqual(155);
  });
});
