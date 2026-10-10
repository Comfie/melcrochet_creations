import { describe, it, expect, afterAll } from "vitest";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { setupTestAdmin } from "@/lib/test-admin";

const owner = setupTestAdmin("OWNER");
const admin = setupTestAdmin("ADMIN");
const created: string[] = [];

afterAll(async () => {
  await prisma.adminUser.deleteMany({ where: { id: { in: created } } });
});

async function req(url: string, cookie: string, method = "GET", body?: unknown) {
  return new NextRequest(`http://localhost:3000${url}`, {
    method,
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function createMember(overrides: Record<string, unknown> = {}) {
  const { POST } = await import("./route");
  const res = await POST(
    await req("/api/admins", await owner.cookie(), "POST", {
      name: "Helper",
      username: `Vitest-Helper-${Math.random().toString(36).slice(2, 8)}`,
      password: "temporary-pass",
      ...overrides,
    })
  );
  const body = await res.json();
  if (res.status === 201) created.push(body.id);
  return { res, body };
}

describe("/api/admins", () => {
  it("is owner-only", async () => {
    const { GET } = await import("./route");
    expect((await GET(await req("/api/admins", await admin.cookie()))).status).toBe(403);
    const res = await GET(await req("/api/admins", await owner.cookie()));
    expect(res.status).toBe(200);
    const list = await res.json();
    expect(list.some((u: { id: string }) => u.id === owner.user.id)).toBe(true);
    expect(list[0].passwordHash).toBeUndefined();
  });

  it("creates an admin with a lowercase username and hashed password", async () => {
    const { res, body } = await createMember({ email: "Helper@Example.com" });
    expect(res.status).toBe(201);
    expect(body.username).toMatch(/^vitest-helper-/);
    expect(body.role).toBe("ADMIN");
    expect(body.email).toBe("helper@example.com");
    const row = await prisma.adminUser.findUniqueOrThrow({ where: { id: body.id } });
    expect(await bcrypt.compare("temporary-pass", row.passwordHash)).toBe(true);
  });

  it("rejects short passwords and duplicate usernames", async () => {
    expect((await createMember({ password: "short" })).res.status).toBe(400);
    const first = await createMember();
    const dup = await createMember({ username: first.body.username });
    expect(dup.res.status).toBe(409);
  });

  it("resets a password and deactivates, signing the person out", async () => {
    const { body } = await createMember();
    const { PATCH } = await import("./[id]/route");
    const params = { params: Promise.resolve({ id: body.id }) };

    let res = await PATCH(await req(`/api/admins/${body.id}`, await owner.cookie(), "PATCH", { password: "brand-new-pass" }), params);
    expect(res.status).toBe(200);
    let row = await prisma.adminUser.findUniqueOrThrow({ where: { id: body.id } });
    expect(row.tokenVersion).toBe(1);
    expect(await bcrypt.compare("brand-new-pass", row.passwordHash)).toBe(true);

    res = await PATCH(await req(`/api/admins/${body.id}`, await owner.cookie(), "PATCH", { isActive: false }), params);
    expect(res.status).toBe(200);
    row = await prisma.adminUser.findUniqueOrThrow({ where: { id: body.id } });
    expect(row.isActive).toBe(false);
    expect(row.tokenVersion).toBe(2);
  });

  it("won't let the owner deactivate or demote themselves", async () => {
    const { PATCH } = await import("./[id]/route");
    const params = { params: Promise.resolve({ id: owner.user.id }) };
    expect((await PATCH(await req("/x", await owner.cookie(), "PATCH", { isActive: false }), params)).status).toBe(400);
    expect((await PATCH(await req("/x", await owner.cookie(), "PATCH", { role: "ADMIN" }), params)).status).toBe(400);
  });

  it("lets an owner demote another owner while an owner remains", async () => {
    const { body } = await createMember({ role: "OWNER" });
    const { PATCH } = await import("./[id]/route");
    const res = await PATCH(
      await req(`/api/admins/${body.id}`, await owner.cookie(), "PATCH", { role: "ADMIN" }),
      { params: Promise.resolve({ id: body.id }) }
    );
    expect(res.status).toBe(200);
  });

  it("is owner-only for edits too", async () => {
    const { PATCH } = await import("./[id]/route");
    const res = await PATCH(await req("/x", await admin.cookie(), "PATCH", { name: "Nope" }), {
      params: Promise.resolve({ id: owner.user.id }),
    });
    expect(res.status).toBe(403);
  });
});
