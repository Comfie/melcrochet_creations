import { describe, it, expect } from "vitest";
import { buildWhatsAppLink, buildProductWhatsAppLink } from "./whatsapp";

describe("buildWhatsAppLink", () => {
  it("builds a wa.me link with the default message when none given", () => {
    const link = buildWhatsAppLink();
    expect(link.startsWith("https://wa.me/27670590600?text=")).toBe(true);
  });

  it("url-encodes a custom message", () => {
    const link = buildWhatsAppLink("Hi there!");
    expect(link).toBe("https://wa.me/27670590600?text=Hi%20there!");
  });
});

describe("buildProductWhatsAppLink", () => {
  it("includes the product name in the encoded message", () => {
    const link = buildProductWhatsAppLink("King Throw Blanket");
    const decoded = decodeURIComponent(link.split("?text=")[1]);
    expect(decoded).toBe("Hi MelCrochet! I'm interested in the King Throw Blanket");
  });
});
