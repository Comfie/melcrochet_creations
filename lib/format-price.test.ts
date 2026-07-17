import { describe, it, expect } from "vitest";
import { formatPrice } from "./format-price";

describe("formatPrice", () => {
  it("formats a FIXED price with the ZAR symbol and no decimals", () => {
    expect(formatPrice("FIXED", 550, "ZAR")).toBe("R550");
  });

  it("does not insert thousands separators (matches existing product page formatting)", () => {
    expect(formatPrice("FIXED", 1600, "ZAR")).toBe("R1600");
  });

  it("returns 'Quote on Request' for QUOTE price type regardless of price value", () => {
    expect(formatPrice("QUOTE", null, "ZAR")).toBe("Quote on Request");
  });

  it("uses the raw currency code as the symbol when currency is not ZAR", () => {
    expect(formatPrice("FIXED", 100, "USD")).toBe("USD100");
  });

  it("accepts a Prisma Decimal-like value (has toString/valueOf)", () => {
    const decimalLike = { valueOf: () => "1200", toString: () => "1200" };
    expect(formatPrice("FIXED", decimalLike, "ZAR")).toBe("R1200");
  });
});
