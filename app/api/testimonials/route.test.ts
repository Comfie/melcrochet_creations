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
    await prisma.testimonial.delete({ where: { id } }).catch(() => {});
  }
});

describe("GET /api/testimonials", () => {
  it("returns 401 when not authenticated", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/testimonials");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns an array when authenticated", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/testimonials", {
      headers: { Cookie: await authCookie() },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

describe("POST /api/testimonials", () => {
  it("creates a testimonial", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/testimonials", {
      method: "POST",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Vitest Tmp Customer",
        quote: "Loved the blanket!",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    createdIds.push(body.id);
    expect(body.customerName).toBe("Vitest Tmp Customer");
  });

  it("rejects an empty quote", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/testimonials", {
      method: "POST",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ customerName: "Vitest Tmp Customer", quote: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
