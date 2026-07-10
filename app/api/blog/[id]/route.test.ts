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

let postId: string;

beforeEach(async () => {
  const title = `Vitest Tmp Post ${Date.now()}`;
  const post = await prisma.blogPost.create({
    data: { title, slug: slugify(title), content: "temp content" },
  });
  postId = post.id;
});

afterEach(async () => {
  await prisma.blogPost.deleteMany({ where: { id: postId } });
});

describe("PATCH /api/blog/[id]", () => {
  it("updates fields", async () => {
    const { PATCH } = await import("./route");
    const req = new NextRequest(`http://localhost:3000/api/blog/${postId}`, {
      method: "PATCH",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ content: "updated content" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: postId }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.content).toBe("updated content");
  });

  it("sets publishedAt the first time published flips to true", async () => {
    const { PATCH } = await import("./route");
    const req = new NextRequest(`http://localhost:3000/api/blog/${postId}`, {
      method: "PATCH",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ published: true }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: postId }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.publishedAt).not.toBeNull();
  });

  it("does not overwrite an existing publishedAt on a later edit", async () => {
    const { PATCH } = await import("./route");
    const firstReq = new NextRequest(`http://localhost:3000/api/blog/${postId}`, {
      method: "PATCH",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ published: true }),
    });
    const firstRes = await PATCH(firstReq, { params: Promise.resolve({ id: postId }) });
    const firstBody = await firstRes.json();
    const originalPublishedAt = firstBody.publishedAt;

    const secondReq = new NextRequest(`http://localhost:3000/api/blog/${postId}`, {
      method: "PATCH",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ content: "a small edit" }),
    });
    const secondRes = await PATCH(secondReq, { params: Promise.resolve({ id: postId }) });
    const secondBody = await secondRes.json();
    expect(secondBody.publishedAt).toBe(originalPublishedAt);
  });

  it("deletes the old Cloudinary cover image when replaced", async () => {
    await prisma.blogPost.update({
      where: { id: postId },
      data: {
        coverImageUrl: "https://res.cloudinary.com/demo/image/upload/v1/melcrochet/old.jpg",
        coverImagePublicId: "melcrochet/old",
      },
    });
    const { deleteImage } = await import("@/lib/cloudinary");
    const { PATCH } = await import("./route");
    const req = new NextRequest(`http://localhost:3000/api/blog/${postId}`, {
      method: "PATCH",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({
        coverImageUrl: "https://res.cloudinary.com/demo/image/upload/v1/melcrochet/new.jpg",
        coverImagePublicId: "melcrochet/new",
      }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: postId }) });
    expect(res.status).toBe(200);
    expect(deleteImage).toHaveBeenCalledWith("melcrochet/old");
  });
});

describe("DELETE /api/blog/[id]", () => {
  it("hard-deletes the post", async () => {
    const { DELETE } = await import("./route");
    const req = new NextRequest(`http://localhost:3000/api/blog/${postId}`, {
      method: "DELETE",
      headers: { Cookie: await authCookie() },
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: postId }) });
    expect(res.status).toBe(204);

    const stillExists = await prisma.blogPost.findUnique({ where: { id: postId } });
    expect(stillExists).toBeNull();
  });
});
