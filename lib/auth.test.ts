import { describe, it, expect, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import { SignJWT } from "jose";
import prisma from "@/lib/prisma";
import { setupTestAdmin } from "@/lib/test-admin";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-for-vitest-only";
});

const owner = setupTestAdmin("OWNER");
const admin = setupTestAdmin("ADMIN");

function requestWith(cookie?: string) {
  return new NextRequest("http://localhost:3000/api/categories", cookie ? { headers: { Cookie: cookie } } : {});
}

describe("signSessionToken / verifySessionToken", () => {
  it("round-trips the user id and token version", async () => {
    const { signSessionToken, verifySessionToken } = await import("./session");
    const session = await verifySessionToken(await signSessionToken("user-1", 3));
    expect(session).toMatchObject({ sub: "user-1", v: 3 });
    expect(session?.iat).toBeGreaterThan(0);
  });

  it("rejects a garbage token", async () => {
    const { verifySessionToken } = await import("./session");
    expect(await verifySessionToken("not-a-real-jwt")).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const wrongSecret = new TextEncoder().encode("a-completely-different-secret");
    const badToken = await new SignJWT({ sub: "user-1", v: 0 })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(wrongSecret);
    const { verifySessionToken } = await import("./session");
    expect(await verifySessionToken(badToken)).toBeNull();
  });

  it("issues 30-day sessions", async () => {
    const { SESSION_MAX_AGE_SECONDS } = await import("./session");
    expect(SESSION_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 30);
  });
});

describe("requireAuth", () => {
  it("returns 401 when no cookie is present", async () => {
    const { requireAuth } = await import("./auth");
    expect((await requireAuth(requestWith()))?.status).toBe(401);
  });

  it("returns 401 when the cookie holds an invalid token", async () => {
    const { requireAuth } = await import("./auth");
    expect((await requireAuth(requestWith("mc_admin=garbage")))?.status).toBe(401);
  });

  it("returns null for an active admin's session", async () => {
    const { requireAuth } = await import("./auth");
    expect(await requireAuth(requestWith(await admin.cookie()))).toBeNull();
  });

  it("rejects a valid token for an account that doesn't exist", async () => {
    const { requireAuth } = await import("./auth");
    const { signSessionToken } = await import("./session");
    const token = await signSessionToken("no-such-user", 0);
    expect((await requireAuth(requestWith(`mc_admin=${token}`)))?.status).toBe(401);
  });

  it("signs out old sessions when the token version changes", async () => {
    const { requireAuth } = await import("./auth");
    const oldCookie = await admin.cookie();
    await prisma.adminUser.update({ where: { id: admin.user.id }, data: { tokenVersion: { increment: 1 } } });
    expect((await requireAuth(requestWith(oldCookie)))?.status).toBe(401);
    expect(await requireAuth(requestWith(await admin.cookie()))).toBeNull();
  });

  it("rejects a deactivated account", async () => {
    const { requireAuth } = await import("./auth");
    const cookie = await admin.cookie();
    await prisma.adminUser.update({ where: { id: admin.user.id }, data: { isActive: false } });
    expect((await requireAuth(requestWith(cookie)))?.status).toBe(401);
    await prisma.adminUser.update({ where: { id: admin.user.id }, data: { isActive: true } });
  });
});

describe("requireOwner", () => {
  it("lets owners through and refuses admins with 403", async () => {
    const { requireOwner } = await import("./auth");
    expect((await requireOwner(requestWith(await owner.cookie()))).session?.user.id).toBe(owner.user.id);
    expect((await requireOwner(requestWith(await admin.cookie()))).response?.status).toBe(403);
  });
});
