import { describe, it, expect } from "vitest";
import { SITE } from "./site";

describe("SITE", () => {
  it("exposes the production URL with no trailing slash", () => {
    expect(SITE.url).toBe("https://melcrochet.co.za");
  });

  it("exposes the WhatsApp number in international format with no plus sign", () => {
    expect(SITE.whatsappNumber).toBe("27670590600");
  });

  it("exposes the official Instagram and YouTube accounts", () => {
    expect(SITE.instagram).toBe("https://www.instagram.com/melcrochet_giftedhands");
    expect(SITE.instagramHandle).toBe("@melcrochet_giftedhands");
    expect(SITE.youtube).toBe("https://www.youtube.com/@melcrochets-85");
  });

  it("exposes brand name and short name", () => {
    expect(SITE.name).toBe("MelCrochet Gifted Hands");
    expect(SITE.shortName).toBe("MelCrochet");
  });
});
