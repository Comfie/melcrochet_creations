import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { signSessionToken, setSessionCookie } from "@/lib/session";
import { jsonError, jsonValidationError } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { passwordChangeSchema } from "../schema";

/**
 * Changes the signed-in admin's password. Bumps tokenVersion so every other
 * device is signed out, then re-issues this device's cookie so the person
 * making the change stays signed in.
 */
export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return jsonError("Unauthorized", 401);

  if (!checkRateLimit(`password:${session.user.id}`, 10, 15 * 60 * 1000)) {
    return jsonError("Too many attempts. Please wait 15 minutes and try again.", 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = passwordChangeSchema.safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.issues);

  const { currentPassword, newPassword } = parsed.data;
  if (!(await bcrypt.compare(currentPassword, session.user.passwordHash))) {
    return jsonError("Your current password is incorrect", 400);
  }

  const user = await prisma.adminUser.update({
    where: { id: session.user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10), tokenVersion: { increment: 1 } },
  });

  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, await signSessionToken(user.id, user.tokenVersion));
  return res;
}
