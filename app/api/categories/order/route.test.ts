import { describe, it, expect, afterAll } from "vitest";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { setupTestAdmin } from "@/lib/test-admin";

const testAdmin = setupTestAdmin();
const original = new Map<string, number>();

afterAll(async () => {
  for (const [id, sortOrder] of original) {
    await prisma.category.update({ where: { id }, data: { sortOrder } });
  }
});

async function put(ids: unknown, cookie?: string) {
  const { PUT } = await import("./route");
  return PUT(
    new NextRequest("http://localhost:3000/api/categories/order", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
      body: JSON.stringify({ ids }),
    })
  );
}

describe("PUT /api/categories/order", () => {
  it("requires auth", async () => {
    expect((await put(["x"])).status).toBe(401);
  });

  it("saves the given order", async () => {
    const cats = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
    for (const c of cats) original.set(c.id, c.sortOrder);
    const reversed = [...cats].reverse().map((c) => c.id);

    const res = await put(reversed, await testAdmin.cookie());
    expect(res.status).toBe(200);
    const after = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
    expect(after.map((c) => c.id)).toEqual(reversed);
  });

  it("rejects unknown or duplicate ids", async () => {
    const [first] = await prisma.category.findMany({ take: 1 });
    expect((await put([first.id, first.id], await testAdmin.cookie())).status).toBe(400);
    expect((await put(["does-not-exist"], await testAdmin.cookie())).status).toBe(400);
  });
});
