import { describe, it, expect } from "vitest";
import robots from "./robots";

describe("robots", () => {
  it("disallows /admin and /api and points at the sitemap", () => {
    const result = robots();
    expect(result.rules).toEqual({
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    });
    expect(result.sitemap).toBe("https://melcrochet-creations.vercel.app/sitemap.xml");
  });
});
