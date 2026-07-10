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
    createdIds.push(body.id);
    expect(body.slug).toBe("vitest-tmp-category");
  });

  it("dedupes slugs when names differ but slugify to the same base", async () => {
    const { POST } = await import("./route");

    const req1 = new NextRequest("http://localhost:3000/api/categories", {
      method: "POST",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Vitest Tmp Collision!" }),
    });
    const res1 = await POST(req1);
    const body1 = await res1.json();
    createdIds.push(body1.id);

    const req2 = new NextRequest("http://localhost:3000/api/categories", {
      method: "POST",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Vitest Tmp Collision?" }),
    });
    const res2 = await POST(req2);
    const body2 = await res2.json();
    createdIds.push(body2.id);

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    expect(body1.slug).toBe("vitest-tmp-collision");
    expect(body2.slug).toBe("vitest-tmp-collision-2");
  });

  it("returns 409 when a category with the same name already exists", async () => {
    const { POST } = await import("./route");

    const req1 = new NextRequest("http://localhost:3000/api/categories", {
      method: "POST",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Vitest Tmp Duplicate" }),
    });
    const res1 = await POST(req1);
    const body1 = await res1.json();
    createdIds.push(body1.id);
    expect(res1.status).toBe(201);

    const req2 = new NextRequest("http://localhost:3000/api/categories", {
      method: "POST",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Vitest Tmp Duplicate" }),
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(409);
    const body2 = await res2.json();
    expect(body2.error).toBe("A category with this name already exists");
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
