import { afterAll, beforeAll } from "vitest";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { AdminRole, AdminUser } from "@prisma/client";
import prisma from "@/lib/prisma";
import { signSessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

/**
 * Test-only: creates a throwaway admin account for the current test file
 * (removed again in afterAll) and signs session cookies for it. Its
 * password is random and never revealed, so the account can't be used to
 * sign in even while it exists in the shared database.
 */
export function setupTestAdmin(role: AdminRole = "OWNER") {
  let user: AdminUser | null = null;

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-vitest-only";
    user = await prisma.adminUser.create({
      data: {
        username: `vitest-${randomBytes(4).toString("hex")}`,
        name: "Vitest Admin",
        role,
        passwordHash: bcrypt.hashSync(randomBytes(24).toString("hex"), 4),
      },
    });
  });

  afterAll(async () => {
    if (user) await prisma.adminUser.delete({ where: { id: user.id } }).catch(() => {});
  });

  function current(): AdminUser {
    if (!user) throw new Error("setupTestAdmin: account not created yet (call inside a test)");
    return user;
  }

  return {
    get user() {
      return current();
    },
    /** A session token for the account's current tokenVersion. */
    async token() {
      const fresh = await prisma.adminUser.findUniqueOrThrow({ where: { id: current().id } });
      return signSessionToken(fresh.id, fresh.tokenVersion);
    },
    async cookie() {
      return `${SESSION_COOKIE_NAME}=${await this.token()}`;
    },
  };
}
