import { describe, it, expect } from "vitest";
import { SITE } from "./site";

describe("SITE", () => {
  it("exposes the production URL with no trailing slash", () => {
    expect(SITE.url).toBe("https://melcrochet-creations.vercel.app");
  });

  it("exposes the WhatsApp number in international format with no plus sign", () => {
    expect(SITE.whatsappNumber).toBe("27670590600");
  });

  it("exposes brand name and short name", () => {
    expect(SITE.name).toBe("MelCrochet Gifted Hands");
    expect(SITE.shortName).toBe("MelCrochet");
  });
});
