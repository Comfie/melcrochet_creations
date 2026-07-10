import "dotenv/config";
import { describe, it, expect, afterEach, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { signSessionToken } from "@/lib/auth";

beforeAll(() => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-vitest-only";
});

const createdIds: string[] = [];

afterEach(async () => {
  while (createdIds.length) {
    const id = createdIds.pop()!;
    await prisma.category.delete({ where: { id } }).catch(() => {});
  }
});

async function authCookie() {
  const token = await signSessionToken("melissa");
  return `mc_admin=${token}`;
}

describe("GET /api/categories", () => {
  it("returns 401 when not authenticated", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/categories");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns all categories when authenticated", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/categories", {
      headers: { Cookie: await authCookie() },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.length).toBeGreaterThanOrEqual(12);
  });
});

describe("POST /api/categories", () => {
  it("creates a category with a server-generated slug", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/categories", {
      method: "POST",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Vitest Tmp Category" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.slug).toBe("vitest-tmp-category");
    createdIds.push(body.id);
  });

  it("rejects invalid input", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/categories", {
      method: "POST",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
