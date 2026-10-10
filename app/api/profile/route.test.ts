import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { setupTestAdmin } from "@/lib/test-admin";
import { getSession } from "@/lib/auth";

const me = setupTestAdmin("ADMIN");
const other = setupTestAdmin("ADMIN");

async function req(url: string, cookie: string, method = "GET", body?: unknown) {
  return new NextRequest(`http://localhost:3000${url}`, {
    method,
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("/api/profile", () => {
  it("returns and updates the signed-in admin's details", async () => {
    const { GET, PATCH } = await import("./route");
    const got = await (await GET(await req("/api/profile", await me.cookie()))).json();
    expect(got.id).toBe(me.user.id);
    expect(got.passwordHash).toBeUndefined();

    const res = await PATCH(await req("/api/profile", await me.cookie(), "PATCH", { name: "  Mel  ", email: "" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Mel");
    expect(body.email).toBeNull();
  });

  it("refuses a username someone else has", async () => {
    const { PATCH } = await import("./route");
    const res = await PATCH(await req("/api/profile", await me.cookie(), "PATCH", { username: other.user.username }));
    expect(res.status).toBe(409);
  });
});

describe("POST /api/profile/password", () => {
  it("needs the current password", async () => {
    await prisma.adminUser.update({ where: { id: me.user.id }, data: { passwordHash: await bcrypt.hash("old-password", 4) } });
    const { POST } = await import("./password/route");
    const res = await POST(
      await req("/api/profile/password", await me.cookie(), "POST", { currentPassword: "nope", newPassword: "new-password-1" })
    );
    expect(res.status).toBe(400);
  });

  it("changes the password, signs out other devices and keeps this one signed in", async () => {
    const oldCookie = await me.cookie();
    const { POST } = await import("./password/route");
    const res = await POST(
      await req("/api/profile/password", oldCookie, "POST", { currentPassword: "old-password", newPassword: "new-password-1" })
    );
    expect(res.status).toBe(200);

    // The old session no longer works…
    expect(await getSession(await req("/x", oldCookie))).toBeNull();
    // …but the cookie returned with the response does.
    const fresh = res.cookies.get("mc_admin")?.value;
    expect(await getSession(await req("/x", `mc_admin=${fresh}`))).not.toBeNull();

    const row = await prisma.adminUser.findUniqueOrThrow({ where: { id: me.user.id } });
    expect(await bcrypt.compare("new-password-1", row.passwordHash)).toBe(true);
  });
});
