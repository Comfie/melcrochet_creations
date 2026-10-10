import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { signSessionToken, setSessionCookie } from "@/lib/session";
import { jsonError, jsonValidationError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const loginSchema = z.object({
  username: z.string().trim().toLowerCase().min(1),
  password: z.string().min(1),
});

// A valid-shaped but never-matching hash, so bcrypt.compare always does
// real work even for unknown usernames — avoids a "no such user answers
// instantly" timing signal. Generated via bcrypt itself so it's well-formed.
const DUMMY_HASH = bcrypt.hashSync("never-matches-anything", 10);

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 15 * 60 * 1000;

/**
 * First sign-in after admin accounts were introduced: there are no
 * AdminUser rows yet, so the original ADMIN_USERNAME / ADMIN_PASSWORD_HASH
 * env credentials are accepted once and turned into the Owner account.
 * From then on accounts live in the database and the env pair is unused.
 */
async function bootstrapOwner(username: string, password: string) {
  const envUsername = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  const matches = await bcrypt.compare(password, envHash || DUMMY_HASH);
  if (!envUsername || !envHash || !matches || username !== envUsername) return null;
  const name = envUsername.charAt(0).toUpperCase() + envUsername.slice(1);
  return prisma.adminUser
    .create({ data: { username: envUsername, name, passwordHash: envHash, role: "OWNER" } })
    // Two first sign-ins at once: the other request created it.
    .catch(() => prisma.adminUser.findUnique({ where: { username: envUsername } }));
}

export async function POST(request: NextRequest) {
  if (!checkRateLimit(`login:${getClientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return jsonError("Too many sign-in attempts. Please wait 15 minutes and try again.", 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonValidationError(parsed.error.issues);
  }
  const { username, password } = parsed.data;

  let user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user && (await prisma.adminUser.count()) === 0) {
    user = await bootstrapOwner(username, password);
  } else {
    const matches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!matches) user = null;
  }

  if (!user || !user.isActive) {
    return jsonError("Invalid username or password", 401);
  }

  await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const token = await signSessionToken(user.id, user.tokenVersion);
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, token);
  return res;
}
