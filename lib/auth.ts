import { SignJWT, jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/api-response";

const COOKIE_NAME = "mc_admin";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(username: string): Promise<string> {
  return new SignJWT({ sub: username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.sub !== "string") return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}

export async function requireAuth(
  request: NextRequest
): Promise<NextResponse | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return jsonError("Unauthorized", 401);
  }
  return null;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
