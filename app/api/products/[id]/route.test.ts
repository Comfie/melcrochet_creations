import "dotenv/config";
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { signSessionToken } from "@/lib/auth";

vi.mock("@/lib/cloudinary", () => ({
  deleteImage: vi.fn(async () => {}),
}));

beforeAll(() => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-vitest-only";
});

async function authCookie() {
  const token = await signSessionToken("melissa");
  return `mc_admin=${token}`;
}

let categoryId: string;
let productId: string;

beforeAll(async () => {
  const category = await prisma.category.findFirstOrThrow({ where: { name: "Hats" } });
  categoryId = category.id;
});

beforeEach(async () => {
  const name = `Vitest Tmp Product ${Date.now()}`;
  const product = await prisma.product.create({
    data: {
      name,
      slug: slugify(name),
      description: "temp",
      priceType: "QUOTE",
      categoryId,
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/melcrochet/old.jpg",
      imagePublicId: "melcrochet/old",
    },
  });
  productId = product.id;
});

afterEach(async () => {
  await prisma.product.deleteMany({ where: { id: productId } });
});

describe("PATCH /api/products/[id]", () => {
  it("updates fields", async () => {
    const { PATCH } = await import("./route");
    const req = new NextRequest(`http://localhost:3000/api/products/${productId}`, {
      method: "PATCH",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ description: "updated description" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: productId }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.description).toBe("updated description");
  });

  it("deletes the old Cloudinary image when the image is replaced", async () => {
    const { deleteImage } = await import("@/lib/cloudinary");
    const { PATCH } = await import("./route");
    const req = new NextRequest(`http://localhost:3000/api/products/${productId}`, {
      method: "PATCH",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/melcrochet/new.jpg",
        imagePublicId: "melcrochet/new",
      }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: productId }) });
    expect(res.status).toBe(200);
    expect(deleteImage).toHaveBeenCalledWith("melcrochet/old");
  });
});

describe("DELETE /api/products/[id]", () => {
  it("soft-deletes (sets isActive false) rather than removing the row", async () => {
    const { DELETE } = await import("./route");
    const req = new NextRequest(`http://localhost:3000/api/products/${productId}`, {
      method: "DELETE",
      headers: { Cookie: await authCookie() },
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: productId }) });
    expect(res.status).toBe(200);

    const stillExists = await prisma.product.findUnique({ where: { id: productId } });
    expect(stillExists).not.toBeNull();
    expect(stillExists?.isActive).toBe(false);
  });
});
