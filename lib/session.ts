import { SignJWT, jwtVerify } from "jose";
import type { NextResponse } from "next/server";

/*
 * Session token primitives — JWT only, no database, so the proxy can import
 * this without pulling Prisma into its bundle. User/role checks that need
 * the database live in lib/auth.ts.
 */

export const SESSION_COOKIE_NAME = "mc_admin";

/**
 * 30 days, renewed while the admin is in use (see /api/auth/me): Melissa
 * only signs in again after a month away, not every week.
 */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
/** @deprecated alias kept for older imports */
export const SESSION_COOKIE_MAX_AGE_SECONDS = SESSION_MAX_AGE_SECONDS;

/** Re-issue the cookie once the current token is older than this. */
export const SESSION_RENEW_AFTER_SECONDS = 60 * 60 * 24;

export interface SessionClaims {
  /** AdminUser id */
  sub: string;
  /** AdminUser.tokenVersion at sign-in — a mismatch means signed out. */
  v: number;
  /** Issued-at, seconds since epoch */
  iat: number;
}

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(userId: string, tokenVersion = 0): Promise<string> {
  return new SignJWT({ sub: userId, v: tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.sub !== "string") return null;
    return {
      sub: payload.sub,
      v: typeof payload.v === "number" ? payload.v : 0,
      iat: typeof payload.iat === "number" ? payload.iat : 0,
    };
  } catch {
    return null;
  }
}

export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}
