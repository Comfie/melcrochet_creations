import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

// No accounts exist yet: the first sign-in with the old env credentials
// must create the Owner account.
const adminUser = {
  findUnique: vi.fn(),
  count: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};
vi.mock("@/lib/prisma", () => ({ default: { adminUser } }));

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret-for-vitest-only";
  process.env.ADMIN_USERNAME = "Melissa";
  process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash("correct-horse", 4);
});

beforeEach(() => {
  vi.clearAllMocks();
  adminUser.findUnique.mockResolvedValue(null);
  adminUser.count.mockResolvedValue(0);
  adminUser.create.mockImplementation(async ({ data }) => ({ id: "owner-1", isActive: true, tokenVersion: 0, ...data }));
  adminUser.update.mockResolvedValue({});
});

function login(body: unknown) {
  return new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.8" },
    body: JSON.stringify(body),
  });
}

describe("first sign-in bootstrap", () => {
  it("creates the Owner from the env credentials", async () => {
    const { POST } = await import("./route");
    const res = await POST(login({ username: "melissa", password: "correct-horse" }));
    expect(res.status).toBe(200);
    expect(adminUser.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ username: "melissa", name: "Melissa", role: "OWNER" }),
    });
  });

  it("does not create an account for wrong env credentials", async () => {
    const { POST } = await import("./route");
    const res = await POST(login({ username: "melissa", password: "wrong" }));
    expect(res.status).toBe(401);
    expect(adminUser.create).not.toHaveBeenCalled();
  });

  it("ignores the env credentials once accounts exist", async () => {
    adminUser.count.mockResolvedValue(1);
    const { POST } = await import("./route");
    const res = await POST(login({ username: "melissa", password: "correct-horse" }));
    expect(res.status).toBe(401);
    expect(adminUser.create).not.toHaveBeenCalled();
  });
});
