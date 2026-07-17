import { describe, it, expect } from "vitest";
import { parseGallery } from "./product-gallery";

describe("parseGallery", () => {
  it("returns an empty array for null", () => {
    expect(parseGallery(null)).toEqual([]);
  });

  it("returns an empty array for undefined", () => {
    expect(parseGallery(undefined)).toEqual([]);
  });

  it("returns an empty array for non-array JSON values", () => {
    expect(parseGallery({ url: "x", publicId: "y" })).toEqual([]);
  });

  it("passes through well-formed entries", () => {
    const value = [{ url: "https://a", publicId: "p1" }, { url: "https://b", publicId: "p2" }];
    expect(parseGallery(value)).toEqual(value);
  });

  it("filters out malformed entries instead of throwing", () => {
    const value = [{ url: "https://a", publicId: "p1" }, { url: 5 }, "not-an-object", null];
    expect(parseGallery(value)).toEqual([{ url: "https://a", publicId: "p1" }]);
  });
});
