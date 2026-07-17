import { describe, it, expect } from "vitest";
import { cld, IMG_SIZES } from "./cloudinary-url";

const SAMPLE = "https://res.cloudinary.com/demo/image/upload/v1699999999/products/abc123.jpg";

describe("cld", () => {
  it("injects the card transformation after /upload/", () => {
    expect(cld(SAMPLE, "card")).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,ar_1:1,w_600/v1699999999/products/abc123.jpg"
    );
  });

  it("injects the detail transformation", () => {
    expect(cld(SAMPLE, "detail")).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1200/v1699999999/products/abc123.jpg"
    );
  });

  it("injects the og transformation", () => {
    expect(cld(SAMPLE, "og")).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,w_1200,h_630/v1699999999/products/abc123.jpg"
    );
  });

  it("replaces an existing transformation segment rather than stacking it", () => {
    const withTransform =
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_300/v1/products/abc.jpg";
    expect(cld(withTransform, "thumb")).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,ar_1:1,w_150/v1/products/abc.jpg"
    );
  });

  it("replaces a transformation containing a colon without duplication", () => {
    const withCardPreset =
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,ar_1:1,w_600/v1/products/abc.jpg";
    expect(cld(withCardPreset, "thumb")).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,ar_1:1,w_150/v1/products/abc.jpg"
    );
  });

  it("returns non-Cloudinary URLs unchanged", () => {
    expect(cld("https://example.com/photo.jpg", "card")).toBe("https://example.com/photo.jpg");
  });
});

describe("IMG_SIZES", () => {
  it("defines sizes attrs for hero, card, detail and thumb", () => {
    expect(IMG_SIZES.hero).toBe("100vw");
    expect(IMG_SIZES.card).toContain("50vw");
    expect(IMG_SIZES.detail).toContain("600px");
    expect(IMG_SIZES.thumb).toBe("80px");
  });
});
