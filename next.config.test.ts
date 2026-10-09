import { describe, it, expect } from "vitest";
import nextConfig, { HTML_LIMITED_BOTS } from "./next.config";

describe("next.config SEO settings", () => {
  it("serves blocking (in-<head>) metadata to Googlebot as well as Next's default bots", () => {
    expect(HTML_LIMITED_BOTS.test("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(true);
    expect(
      HTML_LIMITED_BOTS.test(
        "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
      )
    ).toBe(true);
    expect(HTML_LIMITED_BOTS.test("Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)")).toBe(true);
    expect(HTML_LIMITED_BOTS.test("facebookexternalhit/1.1")).toBe(true);
    expect(HTML_LIMITED_BOTS.test("WhatsApp/2.23.20.0")).toBe(true);
    expect(
      HTML_LIMITED_BOTS.test("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1")
    ).toBe(false);
  });

  it("308-redirects duplicate hosts to the canonical domain in one hop", async () => {
    const redirects = await nextConfig.redirects!();
    const hosts = redirects.map((r) => r.has?.[0]?.value);
    expect(hosts).toEqual(["www.melcrochet.co.za", "melcrochet-creations.vercel.app"]);
    for (const r of redirects) {
      expect(r.permanent).toBe(true);
      expect(r.destination).toBe("https://melcrochet.co.za/:path*");
    }
  });

  it("marks /admin and /api noindex", async () => {
    const headers = await nextConfig.headers!();
    expect(headers.map((h) => h.source)).toEqual(["/admin", "/admin/:path*", "/api/:path*"]);
    for (const h of headers) {
      expect(h.headers).toContainEqual({ key: "X-Robots-Tag", value: "noindex, nofollow" });
    }
  });
});
