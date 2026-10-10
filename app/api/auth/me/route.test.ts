import { describe, it, expect, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import { SignJWT } from "jose";
import { setupTestAdmin } from "@/lib/test-admin";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-for-vitest-only";
});

const testAdmin = setupTestAdmin("OWNER");

describe("GET /api/auth/me", () => {
  it("returns 401 when not authenticated", async () => {
    const { GET } = await import("./route");
    const res = await GET(new NextRequest("http://localhost:3000/api/auth/me"));
    expect(res.status).toBe(401);
  });

  it("returns the signed-in admin without sensitive fields", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/auth/me", {
      headers: { Cookie: await testAdmin.cookie() },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.authenticated).toBe(true);
    expect(body.user).toMatchObject({ id: testAdmin.user.id, username: testAdmin.user.username, role: "OWNER" });
    expect(body.user.passwordHash).toBeUndefined();
    // A fresh token isn't re-issued on every request.
    expect(res.cookies.get("mc_admin")).toBeUndefined();
  });

  it("renews a session that is more than a day old", async () => {
    const { GET } = await import("./route");
    const twoDaysAgo = Math.floor(Date.now() / 1000) - 2 * 86400;
    const oldToken = await new SignJWT({ sub: testAdmin.user.id, v: testAdmin.user.tokenVersion })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(twoDaysAgo)
      .setExpirationTime(twoDaysAgo + 30 * 86400)
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));
    const res = await GET(
      new NextRequest("http://localhost:3000/api/auth/me", { headers: { Cookie: `mc_admin=${oldToken}` } })
    );
    expect(res.status).toBe(200);
    const renewed = res.cookies.get("mc_admin");
    expect(renewed?.value).toBeTruthy();
    expect(renewed?.value).not.toBe(oldToken);
    expect(renewed?.maxAge).toBe(30 * 86400);
  });
});
