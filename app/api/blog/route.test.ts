import "dotenv/config";
import { describe, it, expect, afterEach, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { signSessionToken } from "@/lib/auth";

beforeAll(() => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-vitest-only";
});

async function authCookie() {
  const token = await signSessionToken("melissa");
  return `mc_admin=${token}`;
}

const createdIds: string[] = [];

afterEach(async () => {
  while (createdIds.length) {
    const id = createdIds.pop()!;
    await prisma.blogPost.delete({ where: { id } }).catch(() => {});
  }
});

describe("GET /api/blog", () => {
  it("returns 401 when not authenticated", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/blog");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns an array (including drafts) when authenticated", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/blog", {
      headers: { Cookie: await authCookie() },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

describe("POST /api/blog", () => {
  it("creates a draft post with a server-generated slug and no publishedAt", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/blog", {
      method: "POST",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Vitest Tmp Post",
        content: "Some **markdown** content.",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    createdIds.push(body.id);
    expect(body.slug).toBe("vitest-tmp-post");
    expect(body.published).toBe(false);
    expect(body.publishedAt).toBeNull();
  });

  it("sets publishedAt when created already published", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/blog", {
      method: "POST",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Vitest Tmp Published Post",
        content: "Published from the start.",
        published: true,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    createdIds.push(body.id);
    expect(body.publishedAt).not.toBeNull();
  });
});
