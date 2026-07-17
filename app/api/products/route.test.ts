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
        imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/products/fixed.jpg",
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
        imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/products/quote.jpg",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    createdProductIds.push(body.id);
    expect(body.price).toBeNull();
  });

  it("rejects an active product with no image", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Vitest Tmp No Image",
        description: "no image, defaults to active",
        priceType: "QUOTE",
        categoryId,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("allows an imageless product when explicitly saved as inactive (draft)", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Vitest Tmp Draft",
        description: "draft product, no image yet",
        priceType: "QUOTE",
        categoryId,
        isActive: false,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    createdProductIds.push(body.id);
  });

  it("accepts a gallery array and careInstructions", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Vitest Tmp Gallery Product",
        description: "has a gallery",
        priceType: "QUOTE",
        categoryId,
        imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/products/main.jpg",
        gallery: [
          { url: "https://res.cloudinary.com/demo/image/upload/v1/products/a.jpg", publicId: "products/a" },
        ],
        careInstructions: "Hand wash cold, dry flat.",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    createdProductIds.push(body.id);
    expect(body.gallery).toEqual([
      { url: "https://res.cloudinary.com/demo/image/upload/v1/products/a.jpg", publicId: "products/a" },
    ]);
    expect(body.careInstructions).toBe("Hand wash cold, dry flat.");
  });
});
