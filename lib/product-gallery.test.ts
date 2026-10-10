import { describe, it, expect } from "vitest";
import { parseGallery, orphanedImagePublicIds } from "./product-gallery";

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

describe("orphanedImagePublicIds", () => {
  const img = (id: string) => ({ url: `https://res.cloudinary.com/demo/image/upload/v1/${id}.jpg`, publicId: id });

  it("returns the old main image when it is replaced", () => {
    expect(
      orphanedImagePublicIds({ imagePublicId: "main", gallery: [img("a")] }, { imagePublicId: "new" })
    ).toEqual(["main"]);
  });

  it("returns gallery images that were removed", () => {
    expect(
      orphanedImagePublicIds({ imagePublicId: "main", gallery: [img("a"), img("b")] }, { gallery: [img("b")] })
    ).toEqual(["a"]);
  });

  it("deletes nothing when the main photo is swapped with a gallery photo", () => {
    expect(
      orphanedImagePublicIds(
        { imagePublicId: "main", gallery: [img("a"), img("b")] },
        { imagePublicId: "a", gallery: [img("main"), img("b")] }
      )
    ).toEqual([]);
  });

  it("treats undefined fields as unchanged", () => {
    expect(orphanedImagePublicIds({ imagePublicId: "main", gallery: [img("a")] }, {})).toEqual([]);
  });

  it("ignores a missing existing main image", () => {
    expect(orphanedImagePublicIds({ imagePublicId: null, gallery: [] }, { imagePublicId: "new" })).toEqual([]);
  });
});
