import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  signSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/auth";
import { jsonError, jsonValidationError } from "@/lib/api-response";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// A valid-shaped but never-matching hash, so bcrypt.compare always does
// real work even if ADMIN_PASSWORD_HASH is unset — avoids a trivial
// "unset hash short-circuits instantly" timing signal. Generated via
// bcrypt itself (not hand-typed) so it's guaranteed to be a well-formed
// hash bcrypt.compare can actually process.
const DUMMY_HASH = bcrypt.hashSync("never-matches-anything", 10);

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonValidationError(parsed.error.issues);
  }
  const { username, password } = parsed.data;

  const passwordMatches = await bcrypt.compare(
    password,
    process.env.ADMIN_PASSWORD_HASH || DUMMY_HASH
  );
  const usernameMatches = username === process.env.ADMIN_USERNAME;

  if (!usernameMatches || !passwordMatches) {
    return jsonError("Invalid credentials", 401);
  }

  const token = await signSessionToken(username);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  });
  return res;
}
