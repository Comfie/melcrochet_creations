import { describe, it, expect, beforeAll } from "vitest";
import { NextRequest } from "next/server";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-for-vitest-only";
});

describe("signSessionToken / verifySessionToken", () => {
  it("round-trips a valid token", async () => {
    const { signSessionToken, verifySessionToken } = await import("./auth");
    const token = await signSessionToken("melissa");
    const session = await verifySessionToken(token);
    expect(session).toEqual({ sub: "melissa" });
  });

  it("rejects a garbage token", async () => {
    const { verifySessionToken } = await import("./auth");
    const session = await verifySessionToken("not-a-real-jwt");
    expect(session).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const { SignJWT } = await import("jose");
    const wrongSecret = new TextEncoder().encode("a-completely-different-secret");
    const badToken = await new SignJWT({ sub: "melissa" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(wrongSecret);

    const { verifySessionToken } = await import("./auth");
    const session = await verifySessionToken(badToken);
    expect(session).toBeNull();
  });
});

describe("requireAuth", () => {
  it("returns a 401 response when no cookie is present", async () => {
    const { requireAuth } = await import("./auth");
    const req = new NextRequest("http://localhost:3000/api/categories");
    const result = await requireAuth(req);
    expect(result).not.toBeNull();
    expect(result?.status).toBe(401);
  });

  it("returns null when a valid session cookie is present", async () => {
    const { requireAuth, signSessionToken } = await import("./auth");
    const token = await signSessionToken("melissa");
    const req = new NextRequest("http://localhost:3000/api/categories", {
      headers: { Cookie: `mc_admin=${token}` },
    });
    const result = await requireAuth(req);
    expect(result).toBeNull();
  });

  it("returns a 401 response when the cookie holds an invalid token", async () => {
    const { requireAuth } = await import("./auth");
    const req = new NextRequest("http://localhost:3000/api/categories", {
      headers: { Cookie: "mc_admin=garbage" },
    });
    const result = await requireAuth(req);
    expect(result?.status).toBe(401);
  });
});
