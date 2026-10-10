import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { setupTestAdmin } from "@/lib/test-admin";

vi.mock("@/lib/cloudinary", () => ({ deleteImage: vi.fn(async () => {}) }));

const testAdmin = setupTestAdmin();
let testimonialId: string;

beforeAll(async () => {
  const t = await prisma.testimonial.create({
    data: {
      customerName: "Vitest Discard",
      quote: "temp",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/melcrochet/in-use.jpg",
      imagePublicId: "melcrochet/in-use",
    },
  });
  testimonialId = t.id;
});

afterAll(async () => {
  await prisma.testimonial.delete({ where: { id: testimonialId } }).catch(() => {});
});

async function discard(publicIds: unknown, cookie?: string) {
  const { POST } = await import("./route");
  return POST(
    new NextRequest("http://localhost:3000/api/uploads/discard", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
      body: JSON.stringify({ publicIds }),
    })
  );
}

describe("POST /api/uploads/discard", () => {
  it("requires auth", async () => {
    expect((await discard(["melcrochet/x"])).status).toBe(401);
  });

  it("deletes unused uploads but never one that is in use", async () => {
    const { deleteImage } = await import("@/lib/cloudinary");
    const res = await discard(["melcrochet/unused", "melcrochet/in-use"], await testAdmin.cookie());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ deleted: ["melcrochet/unused"], kept: ["melcrochet/in-use"] });
    expect(deleteImage).toHaveBeenCalledWith("melcrochet/unused");
    expect(deleteImage).not.toHaveBeenCalledWith("melcrochet/in-use");
  });

  it("refuses images outside the admin upload folder", async () => {
    expect((await discard(["samples/sheep"], await testAdmin.cookie())).status).toBe(400);
  });
});
