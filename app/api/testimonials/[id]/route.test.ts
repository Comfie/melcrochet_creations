import "dotenv/config";
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
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

let testimonialId: string;

beforeEach(async () => {
  const testimonial = await prisma.testimonial.create({
    data: {
      customerName: "Vitest Tmp Customer",
      quote: "temp quote",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/melcrochet/old.jpg",
      imagePublicId: "melcrochet/old",
    },
  });
  testimonialId = testimonial.id;
});

afterEach(async () => {
  await prisma.testimonial.deleteMany({ where: { id: testimonialId } });
});

describe("PATCH /api/testimonials/[id]", () => {
  it("updates fields", async () => {
    const { PATCH } = await import("./route");
    const req = new NextRequest(`http://localhost:3000/api/testimonials/${testimonialId}`, {
      method: "PATCH",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ quote: "updated quote" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: testimonialId }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.quote).toBe("updated quote");
  });

  it("deletes the old Cloudinary image when the image is replaced", async () => {
    const { deleteImage } = await import("@/lib/cloudinary");
    const { PATCH } = await import("./route");
    const req = new NextRequest(`http://localhost:3000/api/testimonials/${testimonialId}`, {
      method: "PATCH",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/melcrochet/new.jpg",
        imagePublicId: "melcrochet/new",
      }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: testimonialId }) });
    expect(res.status).toBe(200);
    expect(deleteImage).toHaveBeenCalledWith("melcrochet/old");
  });
});

describe("DELETE /api/testimonials/[id]", () => {
  it("soft-deletes rather than removing the row", async () => {
    const { DELETE } = await import("./route");
    const req = new NextRequest(`http://localhost:3000/api/testimonials/${testimonialId}`, {
      method: "DELETE",
      headers: { Cookie: await authCookie() },
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: testimonialId }) });
    expect(res.status).toBe(200);

    const stillExists = await prisma.testimonial.findUnique({ where: { id: testimonialId } });
    expect(stillExists).not.toBeNull();
    expect(stillExists?.isActive).toBe(false);
  });
});
