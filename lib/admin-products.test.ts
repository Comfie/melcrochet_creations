import { describe, it, expect } from "vitest";
import { photoCount, parsePriceInput } from "./admin-products";

describe("photoCount", () => {
  it("counts the main photo and gallery photos", () => {
    expect(
      photoCount({
        imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/a.jpg",
        gallery: [{ url: "https://res.cloudinary.com/demo/image/upload/v1/b.jpg", publicId: "b" }],
      })
    ).toBe(2);
  });

  it("handles a missing main photo and a malformed gallery", () => {
    expect(photoCount({ imageUrl: null, gallery: null })).toBe(0);
    expect(photoCount({ imageUrl: null, gallery: [{ nope: true }] })).toBe(0);
  });
});

describe("parsePriceInput", () => {
  it("reads plain and formatted amounts", () => {
    expect(parsePriceInput("450")).toBe(450);
    expect(parsePriceInput("R450")).toBe(450);
    expect(parsePriceInput(" 1 250 ")).toBe(1250);
    expect(parsePriceInput("450.5")).toBe(450.5);
  });

  it("accepts a South African decimal comma", () => {
    expect(parsePriceInput("450,50")).toBe(450.5);
  });

  it("rejects empty, zero, negative and malformed input", () => {
    expect(parsePriceInput("")).toBeNull();
    expect(parsePriceInput("0")).toBeNull();
    expect(parsePriceInput("-20")).toBeNull();
    expect(parsePriceInput("abc")).toBeNull();
    expect(parsePriceInput("4.999")).toBeNull();
    expect(parsePriceInput("1,250.00")).toBeNull();
  });
});
