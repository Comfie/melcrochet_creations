import { describe, it, expect } from "vitest";
import { buildWhatsAppLink, buildProductWhatsAppLink, buildOrderMessage } from "./whatsapp";

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

describe("buildOrderMessage", () => {
  it("includes the product name, size, colour and URL when all are given", () => {
    const message = buildOrderMessage({
      productName: "Lap Throw Blanket",
      productUrl: "https://melcrochet-creations.vercel.app/products/lap-throw-blanket",
      colour: "Sage Green",
      size: "80x100cm",
    });
    expect(message).toBe(
      "Hi MelCrochet! I'd like to order the Lap Throw Blanket.\n" +
        "Size: 80x100cm\n" +
        "Colour: Sage Green\n" +
        "https://melcrochet-creations.vercel.app/products/lap-throw-blanket"
    );
  });

  it("omits size and colour lines when not selected", () => {
    const message = buildOrderMessage({
      productName: "Scrunchie",
      productUrl: "https://melcrochet-creations.vercel.app/products/scrunchie",
      colour: null,
      size: null,
    });
    expect(message).toBe(
      "Hi MelCrochet! I'd like to order the Scrunchie.\n" +
        "https://melcrochet-creations.vercel.app/products/scrunchie"
    );
  });
});
