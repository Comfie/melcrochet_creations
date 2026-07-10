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

let categoryId: string;
const createdProductIds: string[] = [];

beforeAll(async () => {
  const category = await prisma.category.findFirstOrThrow({
    where: { name: "Hats" },
  });
  categoryId = category.id;
});

afterEach(async () => {
  while (createdProductIds.length) {
    const id = createdProductIds.pop()!;
    await prisma.product.delete({ where: { id } }).catch(() => {});
  }
});

describe("GET /api/products", () => {
  it("returns 401 when not authenticated", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/products");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns all products (including inactive) when authenticated", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/products", {
      headers: { Cookie: await authCookie() },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.length).toBeGreaterThanOrEqual(21);
  });
});

describe("POST /api/products", () => {
  it("creates a FIXED product with a server-generated slug", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Vitest Tmp Product",
        description: "A temporary test product",
        priceType: "FIXED",
        price: 123,
        categoryId,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    createdProductIds.push(body.id);
    expect(body.slug).toBe("vitest-tmp-product");
  });

  it("rejects a FIXED product with no price", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Vitest Tmp Invalid",
        description: "missing price",
        priceType: "FIXED",
        categoryId,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("creates a QUOTE product with no price", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Vitest Tmp Quote Product",
        description: "quote based",
        priceType: "QUOTE",
        categoryId,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    createdProductIds.push(body.id);
    expect(body.price).toBeNull();
  });
});
