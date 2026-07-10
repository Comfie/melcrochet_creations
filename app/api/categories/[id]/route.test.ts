import "dotenv/config";
import { describe, it, expect, beforeEach, afterEach, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { signSessionToken } from "@/lib/auth";

beforeAll(() => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-vitest-only";
});

async function authCookie() {
  const token = await signSessionToken("melissa");
  return `mc_admin=${token}`;
}

let categoryId: string;

beforeEach(async () => {
  const name = `Vitest Tmp Category ${Date.now()}`;
  const category = await prisma.category.create({
    data: { name, slug: slugify(name) },
  });
  categoryId = category.id;
});

afterEach(async () => {
  await prisma.category.deleteMany({ where: { id: categoryId } });
});

describe("PATCH /api/categories/[id]", () => {
  it("updates the category", async () => {
    const { PATCH } = await import("./route");
    const req = new NextRequest(`http://localhost:3000/api/categories/${categoryId}`, {
      method: "PATCH",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Vitest Tmp Renamed", blurb: "updated" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: categoryId }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.blurb).toBe("updated");
  });
});

describe("DELETE /api/categories/[id]", () => {
  it("deletes a category with no products", async () => {
    const { DELETE } = await import("./route");
    const req = new NextRequest(`http://localhost:3000/api/categories/${categoryId}`, {
      method: "DELETE",
      headers: { Cookie: await authCookie() },
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: categoryId }) });
    expect(res.status).toBe(204);

    const stillThere = await prisma.category.findUnique({ where: { id: categoryId } });
    expect(stillThere).toBeNull();
  });

  it("refuses to delete a category that still has products (409)", async () => {
    const product = await prisma.product.create({
      data: {
        name: "Vitest Tmp Guard Product",
        slug: `vitest-tmp-guard-product-${Date.now()}`,
        description: "temp",
        categoryId,
      },
    });

    const { DELETE } = await import("./route");
    const req = new NextRequest(`http://localhost:3000/api/categories/${categoryId}`, {
      method: "DELETE",
      headers: { Cookie: await authCookie() },
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: categoryId }) });
    expect(res.status).toBe(409);

    await prisma.product.delete({ where: { id: product.id } });
    const stillThere = await prisma.category.findUnique({ where: { id: categoryId } });
    expect(stillThere).not.toBeNull();
  });
});
