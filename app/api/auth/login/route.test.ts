import { describe, it, expect, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret-for-vitest-only";
  process.env.ADMIN_USERNAME = "melissa";
  process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash("correct-horse", 10);
});

describe("POST /api/auth/login", () => {
  it("rejects an invalid request body", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects wrong credentials", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "melissa", password: "wrong" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("accepts correct credentials and sets the session cookie", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "melissa", password: "correct-horse" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const cookie = res.cookies.get("mc_admin");
    expect(cookie).toBeDefined();
    expect(cookie?.value.length).toBeGreaterThan(10);
  });
});
