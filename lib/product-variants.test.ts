import { describe, it, expect } from "vitest";
import { parseVariantList } from "./product-variants";

describe("parseVariantList", () => {
  it("splits a comma-separated string and trims whitespace", () => {
    expect(parseVariantList("Cream, Sage Green,  Charcoal")).toEqual([
      "Cream",
      "Sage Green",
      "Charcoal",
    ]);
  });

  it("returns an empty array for null", () => {
    expect(parseVariantList(null)).toEqual([]);
  });

  it("returns an empty array for undefined", () => {
    expect(parseVariantList(undefined)).toEqual([]);
  });

  it("returns an empty array for an empty string", () => {
    expect(parseVariantList("")).toEqual([]);
  });

  it("drops empty entries from trailing/double commas", () => {
    expect(parseVariantList("Cream,, Sage,")).toEqual(["Cream", "Sage"]);
  });
});
