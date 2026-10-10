import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const USERNAME = `vitest-login-${Date.now()}`;
let userId: string;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret-for-vitest-only";
  const user = await prisma.adminUser.create({
    data: { username: USERNAME, name: "Login Test", passwordHash: await bcrypt.hash("correct-horse", 4) },
  });
  userId = user.id;
});

afterAll(async () => {
  await prisma.adminUser.delete({ where: { id: userId } }).catch(() => {});
});

function login(body: unknown) {
  return new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.7" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  it("rejects an invalid request body", async () => {
    const { POST } = await import("./route");
    expect((await POST(login({ username: "" }))).status).toBe(400);
  });

  it("rejects wrong credentials", async () => {
    const { POST } = await import("./route");
    expect((await POST(login({ username: USERNAME, password: "wrong" }))).status).toBe(401);
    expect((await POST(login({ username: "nobody-here", password: "correct-horse" }))).status).toBe(401);
  });

  it("accepts correct credentials, ignoring username case and spaces", async () => {
    const { POST } = await import("./route");
    const res = await POST(login({ username: ` ${USERNAME.toUpperCase()} `, password: "correct-horse" }));
    expect(res.status).toBe(200);
    const cookie = res.cookies.get("mc_admin");
    expect(cookie?.value.length).toBeGreaterThan(10);
    expect(cookie?.maxAge).toBe(30 * 86400);
    const user = await prisma.adminUser.findUniqueOrThrow({ where: { id: userId } });
    expect(user.lastLoginAt).not.toBeNull();
  });

  it("refuses a deactivated account", async () => {
    const { POST } = await import("./route");
    await prisma.adminUser.update({ where: { id: userId }, data: { isActive: false } });
    expect((await POST(login({ username: USERNAME, password: "correct-horse" }))).status).toBe(401);
    await prisma.adminUser.update({ where: { id: userId }, data: { isActive: true } });
  });
});
