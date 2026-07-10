import { describe, it, expect } from "vitest";
import { checkRateLimit, getClientIp } from "./rate-limit";
import { NextRequest } from "next/server";

describe("checkRateLimit", () => {
  it("allows requests up to the limit, then blocks", () => {
    const key = `test-key-${Date.now()}-${Math.random()}`;
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(checkRateLimit(key, 3, 60_000)).toBe(false);
  });

  it("tracks separate keys independently", () => {
    const keyA = `test-key-a-${Date.now()}`;
    const keyB = `test-key-b-${Date.now()}`;
    expect(checkRateLimit(keyA, 1, 60_000)).toBe(true);
    expect(checkRateLimit(keyB, 1, 60_000)).toBe(true);
    expect(checkRateLimit(keyA, 1, 60_000)).toBe(false);
  });
});

describe("getClientIp", () => {
  it("reads the first IP from x-forwarded-for", () => {
    const req = new NextRequest("http://localhost:3000/api/enquiries", {
      headers: { "x-forwarded-for": "203.0.113.4, 70.41.3.18" },
    });
    expect(getClientIp(req)).toBe("203.0.113.4");
  });

  it("falls back to 'unknown' with no header", () => {
    const req = new NextRequest("http://localhost:3000/api/enquiries");
    expect(getClientIp(req)).toBe("unknown");
  });
});
