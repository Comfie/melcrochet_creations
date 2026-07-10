import { describe, it, expect, vi, beforeAll } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/cloudinary", () => ({
  uploadImageBuffer: vi.fn(async () => ({
    url: "https://res.cloudinary.com/demo/image/upload/v1/melcrochet/fake.jpg",
    publicId: "melcrochet/fake",
  })),
  deleteImage: vi.fn(async () => {}),
}));

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-for-vitest-only";
});

function makeUploadRequest(file: File | null, cookie?: string) {
  const formData = new FormData();
  if (file) formData.set("file", file);
  return new NextRequest("http://localhost:3000/api/uploads", {
    method: "POST",
    headers: cookie ? { Cookie: cookie } : undefined,
    body: formData,
  });
}

describe("POST /api/uploads", () => {
  it("returns 401 when not authenticated", async () => {
    const { POST } = await import("./route");
    const file = new File([new Uint8Array([1, 2, 3])], "photo.jpg", {
      type: "image/jpeg",
    });
    const res = await POST(makeUploadRequest(file));
    expect(res.status).toBe(401);
  });

  it("returns 400 when no file is provided", async () => {
    const { POST } = await import("./route");
    const { signSessionToken } = await import("@/lib/auth");
    const token = await signSessionToken("melissa");
    const res = await POST(makeUploadRequest(null, `mc_admin=${token}`));
    expect(res.status).toBe(400);
  });

  it("returns 400 for an unsupported file type", async () => {
    const { POST } = await import("./route");
    const { signSessionToken } = await import("@/lib/auth");
    const token = await signSessionToken("melissa");
    const file = new File([new Uint8Array([1, 2, 3])], "doc.pdf", {
      type: "application/pdf",
    });
    const res = await POST(makeUploadRequest(file, `mc_admin=${token}`));
    expect(res.status).toBe(400);
  });

  it("uploads a valid image and returns url + publicId", async () => {
    const { POST } = await import("./route");
    const { signSessionToken } = await import("@/lib/auth");
    const token = await signSessionToken("melissa");
    const file = new File([new Uint8Array([1, 2, 3])], "photo.jpg", {
      type: "image/jpeg",
    });
    const res = await POST(makeUploadRequest(file, `mc_admin=${token}`));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      url: "https://res.cloudinary.com/demo/image/upload/v1/melcrochet/fake.jpg",
      publicId: "melcrochet/fake",
    });
  });
});
