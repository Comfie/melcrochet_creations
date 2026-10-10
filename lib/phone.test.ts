import { describe, it, expect } from "vitest";
import { toInternationalDigits, customerWhatsAppLink, customerTelLink } from "./phone";

describe("toInternationalDigits", () => {
  it("converts a South African local number to international form", () => {
    expect(toInternationalDigits("067 059 0600")).toBe("27670590600");
    expect(toInternationalDigits("(082) 123-4567")).toBe("27821234567");
  });

  it("keeps numbers already in international form", () => {
    expect(toInternationalDigits("+27 67 059 0600")).toBe("27670590600");
    expect(toInternationalDigits("27670590600")).toBe("27670590600");
    expect(toInternationalDigits("0027 67 059 0600")).toBe("27670590600");
    expect(toInternationalDigits("+263 77 123 4567")).toBe("263771234567");
  });

  it("returns null for empty or implausible input", () => {
    expect(toInternationalDigits(null)).toBeNull();
    expect(toInternationalDigits("")).toBeNull();
    expect(toInternationalDigits("12345")).toBeNull();
    expect(toInternationalDigits("call me")).toBeNull();
  });
});

describe("customer links", () => {
  it("builds a wa.me link, optionally with a pre-filled message", () => {
    expect(customerWhatsAppLink("067 059 0600")).toBe("https://wa.me/27670590600");
    expect(customerWhatsAppLink("067 059 0600", "Hi Thandi!")).toBe(
      "https://wa.me/27670590600?text=Hi%20Thandi!"
    );
  });

  it("builds a tel: link with a leading plus", () => {
    expect(customerTelLink("067 059 0600")).toBe("tel:+27670590600");
  });

  it("returns null when the number can't be used", () => {
    expect(customerWhatsAppLink("n/a")).toBeNull();
    expect(customerTelLink(undefined)).toBeNull();
  });
});
