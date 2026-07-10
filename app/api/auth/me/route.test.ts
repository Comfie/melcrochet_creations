import { describe, it, expect, beforeAll } from "vitest";
import { NextRequest } from "next/server";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-for-vitest-only";
});

describe("GET /api/auth/me", () => {
  it("returns 401 when not authenticated", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/auth/me");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns the username when authenticated", async () => {
    const { GET } = await import("./route");
    const { signSessionToken } = await import("@/lib/auth");
    const token = await signSessionToken("melissa");
    const req = new NextRequest("http://localhost:3000/api/auth/me", {
      headers: { Cookie: `mc_admin=${token}` },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ authenticated: true, username: "melissa" });
  });
});
