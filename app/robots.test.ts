import { describe, it, expect, afterEach, vi } from "vitest";
import robots from "./robots";

describe("robots", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("disallows /admin and /api and points at the sitemap in production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    const result = robots();
    expect(result.rules).toEqual({
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    });
    expect(result.sitemap).toBe("https://melcrochet.co.za/sitemap.xml");
  });

  it("treats a build without VERCEL_ENV (local) as production", () => {
    vi.stubEnv("VERCEL_ENV", "");
    expect(robots().rules).toMatchObject({ allow: "/" });
  });

  it("blocks all crawling on Vercel preview deployments", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const result = robots();
    expect(result.rules).toEqual({ userAgent: "*", disallow: "/" });
    expect(result.sitemap).toBeUndefined();
  });
});
