import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
vi.mock("@/lib/prisma", () => ({ default: { product: { findUnique: vi.fn(), deleteMany: vi.fn(), update: vi.fn() } } }));
vi.mock("@/lib/auth", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/revalidate", () => ({ revalidatePublicSite: vi.fn() }));
vi.mock("@/lib/cloudinary", () => ({ deleteImage: vi.fn() }));
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { deleteImage } from "@/lib/cloudinary";
import { revalidatePublicSite } from "@/lib/revalidate";
import { DELETE } from "./route";

const context = { params: Promise.resolve({ id: "product-1" }) };
const request = (permanent = true) => new NextRequest(`http://localhost/api/products/product-1${permanent ? "?permanent=true" : ""}`, { method: "DELETE" });

beforeEach(() => { vi.resetAllMocks(); vi.mocked(requireAuth).mockResolvedValue(null); });

describe("permanent product deletion", () => {
  it("requires authentication before reading or deleting records", async () => {
    vi.mocked(requireAuth).mockResolvedValue(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    expect((await DELETE(request(), context)).status).toBe(401);
    expect(prisma.product.findUnique).not.toHaveBeenCalled();
    expect(prisma.product.deleteMany).not.toHaveBeenCalled();
  });
  it("rejects deletion of live products", async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: "product-1", isActive: true } as Awaited<ReturnType<typeof prisma.product.findUnique>>);
    expect((await DELETE(request(), context)).status).toBe(409);
    expect(prisma.product.deleteMany).not.toHaveBeenCalled();
  });
  it("deletes a hidden product while preserving photos and invalidating the public site", async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: "product-1", isActive: false } as Awaited<ReturnType<typeof prisma.product.findUnique>>);
    vi.mocked(prisma.product.deleteMany).mockResolvedValue({ count: 1 });
    const response = await DELETE(request(), context);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: "product-1", deleted: true });
    expect(prisma.product.deleteMany).toHaveBeenCalledWith({ where: { id: "product-1", isActive: false } });
    expect(deleteImage).not.toHaveBeenCalled();
    expect(revalidatePublicSite).toHaveBeenCalledOnce();
  });
  it("returns 404 for missing products", async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue(null);
    expect((await DELETE(request(), context)).status).toBe(404);
    expect(prisma.product.deleteMany).not.toHaveBeenCalled();
  });
  it("does not delete a product republished during confirmation", async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: "product-1", isActive: false } as Awaited<ReturnType<typeof prisma.product.findUnique>>);
    vi.mocked(prisma.product.deleteMany).mockResolvedValue({ count: 0 });
    expect((await DELETE(request(), context)).status).toBe(409);
    expect(revalidatePublicSite).not.toHaveBeenCalled();
  });
  it("keeps the existing reversible hide action", async () => {
    vi.mocked(prisma.product.update).mockResolvedValue({ id: "product-1", isActive: false } as Awaited<ReturnType<typeof prisma.product.update>>);
    expect((await DELETE(request(false), context)).status).toBe(200);
    expect(prisma.product.update).toHaveBeenCalledWith({ where: { id: "product-1" }, data: { isActive: false } });
    expect(prisma.product.deleteMany).not.toHaveBeenCalled();
  });
});
