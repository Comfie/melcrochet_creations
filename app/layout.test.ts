import { describe, it, expect, vi } from "vitest";

// next/font only works inside the Next.js compiler.
vi.mock("next/font/google", () => ({
  Cormorant_Garamond: () => ({ variable: "font-cormorant" }),
  Manrope: () => ({ variable: "font-manrope" }),
}));

const { metadata } = await import("./layout");

describe("root layout metadata", () => {
  it("renders the Google Search Console verification tag on every page", () => {
    expect(metadata.verification?.google).toBe(
      process.env.GOOGLE_SITE_VERIFICATION || "q7KeLbFyJxBKagn5PtSmIqZfZ7shGhmffnbde2iia2s"
    );
  });
});
